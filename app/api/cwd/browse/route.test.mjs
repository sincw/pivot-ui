import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { POST } = await jiti.import("./route.ts");

test("creates a named workspace and rejects path traversal", async (t) => {
  const parent = await mkdtemp(join(homedir(), "pivot-ui-cwd-test-"));
  t.after(() => rm(parent, { recursive: true, force: true }));

  const create = await POST(new Request("http://localhost/api/cwd/browse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: parent, name: "my-workspace" }),
  }));
  assert.equal(create.status, 200);
  assert.deepEqual(await create.json(), { path: join(parent, "my-workspace") });

  const traversal = await POST(new Request("http://localhost/api/cwd/browse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: parent, name: "../outside" }),
  }));
  assert.equal(traversal.status, 400);
});
