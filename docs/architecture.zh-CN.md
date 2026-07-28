# Pivot UI 核心架构

> 一句话：**Pivot UI 是 pi coding agent 的本地控制台。**
> 
> 它把本机已有的会话文件读出来展示；用户发送消息时，才在 Next.js
> 服务端启动对应的 AgentSession；结果再通过 SSE 实时推回浏览器。

```text
浏览器（React）
    │ HTTP：读取数据、发送命令
    │ SSE：接收流式事件
    ▼
Next.js（app/api）
    │ 读写本地文件、管理运行中的会话
    ▼
pi SDK / AgentSession
    │
    ├── ~/.pi/agent/sessions/   会话历史（.jsonl）
    ├── 项目工作目录            文件、Git、终端
    └── ~/.pi/agent/...         模型、认证、技能等配置
```

## 先记住两件事

### 1. 看会话，不启动 Agent

左侧会话列表和历史消息是**只读**的：

```text
SessionSidebar / ChatWindow
  → GET /api/sessions
  → lib/session-reader.ts
  → pi 的 SessionManager
  → .jsonl 会话文件
```

这样打开旧会话很轻，不会为每个会话都启动一个 Agent。

### 2. 发消息，才启动 Agent

用户在聊天框发送内容后的路径：

```text
ChatInput
  → POST /api/agent/[id]
  → lib/rpc-manager.ts：startRpcSession()
  → pi AgentSession.prompt()
  → 模型 / 工具执行
  → AgentSession 事件
  → GET /api/agent/[id]/events（SSE）
  → hooks/useAgentSession.ts
  → ChatWindow 实时渲染
```

`rpc-manager.ts` 是运行时的唯一入口。它按 session id 缓存一个
`AgentSessionWrapper`，并在空闲 10 分钟后释放，避免热重载或并发请求创建重复会话。

## 四层分别做什么

| 层 | 主要位置 | 职责 |
| --- | --- | --- |
| 页面层 | `components/` | 展示聊天、侧栏、输入框、配置弹窗、右侧工具面板 |
| 状态与交互层 | `hooks/` | 连接 SSE、投影流式事件、处理重连和运行状态 |
| API 层 | `app/api/` | 浏览器与本地能力之间的边界；校验请求并调用 `lib/` |
| 本地服务层 | `lib/` | 会话读取、Agent 生命周期、文件访问、Git、工作树、技能包等核心逻辑 |

页面不要直接读磁盘或调用 pi SDK；这两件事都应经过 API 和 `lib/`。

## 前端的三个主要区域

```text
AppShell
├── SessionSidebar        项目、工作树和会话树
├── ChatWindow            当前会话
│   ├── useAgentSession   会话数据、SSE、命令、运行状态
│   ├── useChatViewport   滚动、分页、迷你地图定位
│   └── ChatInput         草稿、附件、补全和发送
└── RightPanel            文件预览、Git Review、Terminal 等标签页
```

最重要的边界：`useAgentSession` 管**会话与网络状态**，
`useChatViewport` 管**DOM、滚动和分页**。两者不要混在一起。

右侧面板采用注册表模式：新增同级工具时，创建一个
`components/right-panel/*Tool.tsx`，再登记到 `tool-registry.ts`；文件预览则是普通标签页，不是工具注册项。

## 后端的关键边界

| 需求 | 入口 | 核心实现 |
| --- | --- | --- |
| 列表、历史、分支上下文 | `/api/sessions/*` | `session-reader.ts` + `SessionManager` |
| 新建或继续聊天 | `/api/agent/*` | `rpc-manager.ts` + `AgentSession` |
| 实时聊天状态 | `/api/agent/[id]/events` | SSE + `AgentSession.subscribe()` |
| 工作区文件 | `/api/files`、`/api/workspace-files` | `file-access.ts` 等访问边界 |
| Git 与工作树 | `/api/git`、`/api/worktrees` | `git-*`、`worktree.ts` |
| 技能、MCP、Skill Pack | `/api/skills`、`/api/skill-packs` | `skill-*`、`mcp-*` |

`/api/files` 只读；写入工作区必须走 `/api/workspace-files`。文件访问并不是通用文件浏览器，只允许已知项目和会话工作目录。

## 数据放在哪里

```text
项目仓库
├── app/          Next.js 页面和 API 路由
├── components/   React 视图
├── hooks/        客户端交互状态
└── lib/          可复用的服务端/纯逻辑

用户本机
├── ~/.pi/agent/sessions/       pi 会话 .jsonl 文件
├── ~/.pi/agent/                pi 的模型、认证和资源配置
└── ~/.pivot-ui/lib/skills/     默认共享 Skill Library
```

会话 `.jsonl` 是事实来源。Pivot UI 不把聊天历史另存到数据库。

## 两种“分支”不要混淆

| 操作 | 结果 | 用途 |
| --- | --- | --- |
| Fork | 新建一个 `.jsonl` 会话文件 | 从某条用户消息开始独立探索 |
| Continue / 会话内分支 | 仍在同一个 `.jsonl` 中切换叶子节点 | 在同一会话树里选择不同回答路径 |

Fork 后必须销毁旧 id 对应的内存 wrapper，因为 pi 的 `fork()` 会在原对象内切换到新会话；这是 `rpc-manager.ts` 特别处理的生命周期陷阱。

## 修改功能时，从这里找入口

| 想改什么 | 先看 |
| --- | --- |
| 聊天流式、重连、发送命令 | `hooks/useAgentSession.ts`、`lib/rpc-manager.ts` |
| 会话树、历史读取、Fork | `lib/session-reader.ts`、`app/api/sessions/` |
| 聊天布局或输入体验 | `components/ChatWindow.tsx`、`ChatInput.tsx`、`useChatViewport.ts` |
| 右侧文件或 Review | `components/right-panel/` |
| 文件访问权限 | `lib/file-access.ts`、`lib/allowed-roots.ts` |
| Skill Pack 的应用逻辑 | `lib/skill-pack-apply.ts`、`lib/mcp-pack-apply.ts` |

## 开发时的最低检查

```bash
node_modules/.bin/tsc --noEmit
npm run lint
```

开发服务器使用 `npm run dev`（端口 `30141`）。开发期间不要运行 `next build`，它会污染 `.next/` 并影响开发服务器。
