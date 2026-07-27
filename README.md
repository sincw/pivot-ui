# Pivot UI

[中文文档](./README.zh-CN.md)

Pivot UI is a responsive local workspace for the [pi coding agent](https://github.com/badlogic/pi-mono). It brings sessions, agent chat, project files, Git review, terminals, and agent configuration into one interface that works well on desktop and phone.

![Pivot UI desktop](./docs/image/desktop.png)

## Origin and license

Pivot UI is an independently maintained fork of [agegr/pi-web](https://github.com/agegr/pi-web). It is distributed under the [MIT License](./LICENSE).

## Special Thanks

<p align="center">
  <a href="https://linux.do">
    <img src="docs/image/linuxdo.png" alt="LINUX DO" width="420" />
  </a>
</p>
<p align="center"><b>For all things AI, head to LINUX DO! Wishing the community ever greater success~</b></p>

## Built for active agent work

- **Resume real sessions**: browse local pi sessions by project, follow live streaming output, inspect context and cost, then continue from where you left off.
- **Explore without losing a path**: fork a session into a new file or switch between in-session branches. Export a conversation as standalone HTML when you need to share it.
- **Keep the project beside the chat**: browse the workspace, mention files with `@`, and preview source, Markdown, HTML, images, audio, PDF, and DOCX without leaving the conversation.
- **Review the actual change**: open Changes, branch comparisons, and commit history in the right panel, with unified or side-by-side diffs for an individual file.

![Git review](./docs/image/GitReview.png)

## One workspace, not just a chat window

- **Worktrees**: create, switch, and remove Git worktrees from the workspace switcher. Sessions from linked worktrees stay grouped with their parent project.
- **Project terminals**: open persistent terminal tabs for the selected project, with command history and favorites. They remain available while you move through the workspace.
- **Models and authentication**: choose configured models, manage API keys and OAuth/device-code login, and test model connections from the UI.
- **Skills, plugins, and MCP**: search and install skills, manage package plugins, keep reusable skills and MCP server definitions in a library, and apply versioned Skill Packs to a workspace with a preview before changes are written.
- **Comfortable viewing**: switch among light, dark, and eye-comfort themes.

## Reuse skills with Skill Packs

A Skill Pack combines reusable skill snapshots with MCP server definitions, so a proven agent setup can be applied to another workspace. Build Packs from the shared library, preview the exact workspace changes, then confirm the apply.

Each Pack records the version of its referenced skills and servers. Pivot UI blocks missing, stale, or conflicting references before changing the workspace, and protects MCP entries it does not own. After a Pack change, idle sessions reload their available skills; active sessions reload when the current run finishes.

![Skill Packs](./docs/image/skill_packs.png)

## Made for desktop and mobile

Pivot UI changes its layout rather than only shrinking it on a narrow screen.

- The project sidebar becomes a drawer and closes after a session or workspace is selected, leaving the chat visible.
- Session controls, branch navigation, model selection, and configuration panels use compact, viewport-bounded layouts.
- The right panel is closed by default on mobile and can be opened only when a file, review, or terminal needs attention.
- The terminal includes touch-friendly controls, modifier keys, command history, and visual-viewport handling so the software keyboard does not cover the active prompt.

![Pivot UI on mobile](./docs/image/mobile1.jpg)
![Pivot UI mobile terminal](./docs/image/mobile2.jpg)

## Quick start

For normal use, run the production server. `npm run dev` is only for changing Pivot UI; it compiles routes on demand and is slower after restarts.

Run from source:

```bash
git clone https://github.com/sincw/pivot-ui.git
cd pivot-ui
npm install
npm run build
npm run start
```

After `@sincw/pivot-ui` is published to npm, you can also run the bundled production build without installing:

```bash
npx @sincw/pivot-ui@latest
```

Or install it globally:

```bash
npm install -g @sincw/pivot-ui
pivot-ui
```

Open [http://localhost:30141](http://localhost:30141). The CLI opens a browser after the server is ready unless disabled.

```bash
pivot-ui --port 8080              # custom port
pivot-ui --hostname 127.0.0.1     # local access only
pivot-ui --no-open                # do not open a browser

PORT=8080 pivot-ui                # choose a port
PIVOT_UI_NO_OPEN=1 pivot-ui       # useful for a background service
```

## Gateway authentication

Every page and API requires a gateway token. On startup, `PIVOT_GATEWAY_TOKEN` takes precedence when configured; otherwise Pivot UI reads `~/.pivot-ui/gateway-token`, creating it when absent. The startup log identifies the active source. Open Pivot UI and enter that value on the login page.

The signed session does not expire server-side and its cookie expires in year 9999, though browsers can impose a shorter storage limit. It remains valid until browser data is cleared or the active gateway token changes. Treat the token like a password: anyone with it can access the local sessions, workspace files, and terminals exposed by this server.

## Environment configuration

Next.js loads `.env*` files into the server environment; `.env*` is ignored by Git in this repository. Use `.env.local` for machine-specific secrets and never use a `NEXT_PUBLIC_` prefix for secrets. Restart a production server after changing its environment.

```bash
# .env.local
PIVOT_GATEWAY_TOKEN=replace-with-a-long-random-token
PIVOT_ALLOWED_DEV_ORIGINS=home.sinc.lol
```

| Variable | Purpose |
| --- | --- |
| `PIVOT_GATEWAY_TOKEN` | Gateway token, up to 128 characters. Overrides `~/.pivot-ui/gateway-token`; changing it invalidates existing login cookies after restart. |
| `PIVOT_ALLOWED_DEV_ORIGINS` | Comma-separated additional development hostnames for a custom domain or reverse proxy. `localhost` and `127.0.0.1` are always allowed. |
| `PI_CODING_AGENT_DIR` | Alternative pi agent data directory. |
| `SKILLS_WEB_URL` | Base URL used for Skill rankings and links. Defaults to `https://skills.sh`. |
| `SKILLS_API_URL` | Base URL for Skill search and update checks. Defaults to `https://skills.sh`. |
| `GITHUB_TOKEN` or `GH_TOKEN` | Optional GitHub token used while checking Skill updates. |

`PORT`, `HOSTNAME`, and `PIVOT_UI_NO_OPEN` configure the `pivot-ui` launcher before Next.js loads `.env*`; pass them in the command environment as shown above instead of relying on an env file.

## Local data and safety

- Session history remains in pi's local `~/.pi/agent/sessions` directory. Set `PI_CODING_AGENT_DIR` to use another pi agent directory.
- File browsing is scoped to selected projects and session-known working directories; it is not a general filesystem browser.
- The default Skill Library is `~/.pivot-ui/lib/skills`. An existing explicit library path in pi's Skill Pack configuration is left unchanged.

## Development

```bash
npm install
npm run dev
```

Use the development server only while changing Pivot UI. It runs at [http://localhost:30141](http://localhost:30141).

```bash
node --test lib/*.test.mjs components/*.test.mjs
node_modules/.bin/tsc --noEmit
npm run lint
```

Do not run `next build` during local development. It writes to `.next/` and can interfere with the development server; reserve production builds for releases.
