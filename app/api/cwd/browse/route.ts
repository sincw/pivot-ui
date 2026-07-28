import { NextResponse } from "next/server";
import { mkdirSync, opendirSync, realpathSync, statSync } from "fs";
import { isAbsolute, relative, resolve } from "path";

const DIRECTORY_SCAN_LIMIT = 1_000;
const DIRECTORY_LIST_LIMIT = 500;

function isWithin(root: string, target: string): boolean {
  const pathFromRoot = relative(root, target);
  return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot));
}

// GET /api/cwd/browse?path=/project
// Lists one directory level for the workspace picker.
export async function GET(request: Request) {
  const requestedPath = new URL(request.url).searchParams.get("path");

  try {
    const candidate = requestedPath ? resolve(requestedPath) : "/";
    const directory = realpathSync(candidate);
    if (!statSync(directory).isDirectory()) {
      return NextResponse.json({ error: "Directory is not available" }, { status: 400 });
    }

    const entries: { name: string; path: string }[] = [];
    const dir = opendirSync(directory);
    let scanned = 0;
    try {
      while (scanned++ < DIRECTORY_SCAN_LIMIT && entries.length < DIRECTORY_LIST_LIMIT) {
        const entry = dir.readSync();
        if (!entry) break;
        try {
          const childPath = realpathSync(resolve(directory, entry.name));
          if (statSync(childPath).isDirectory()) entries.push({ name: entry.name, path: childPath });
        } catch {
          // Ignore entries that disappear or cannot be inspected.
        }
      }
    } finally {
      dir.closeSync();
    }

    return NextResponse.json({ path: directory, entries: entries.sort((a, b) => a.name.localeCompare(b.name)) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

// POST /api/cwd/browse  body: { path, name }
// Creates a named workspace below the currently browsed directory.
export async function POST(request: Request) {
  try {
    const body = await request.json() as { path?: unknown; name?: unknown };
    const requestedPath = typeof body.path === "string" ? body.path : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!requestedPath) return NextResponse.json({ error: "Path is required" }, { status: 400 });
    if (!name || name === "." || name === ".." || /[\\/]/.test(name)) {
      return NextResponse.json({ error: "Workspace name must be a single folder name" }, { status: 400 });
    }

    const candidate = resolve(requestedPath);
    const directory = realpathSync(candidate);
    if (!statSync(directory).isDirectory()) {
      return NextResponse.json({ error: "Directory is not available" }, { status: 400 });
    }

    const workspacePath = resolve(directory, name);
    if (!isWithin(directory, workspacePath)) {
      return NextResponse.json({ error: "Workspace name is not available" }, { status: 400 });
    }
    mkdirSync(workspacePath);
    return NextResponse.json({ path: workspacePath });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "EEXIST") {
      return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
