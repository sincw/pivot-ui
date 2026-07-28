// Chinese translations
// Key terms that should NOT be translated:
// Skills, MCP, Packs, Plugins, Prompts, Extensions, Themes, Pivot UI

const zh: Record<string, string> = {
  // General
  "general.loading": "加载中...",
  "general.error": "错误",
  "general.save": "保存",
  "general.saving": "保存中...",
  "general.saved": "已保存",
  "general.cancel": "取消",
  "general.close": "关闭",
  "general.delete": "删除",
  "general.rename": "重命名",
  "general.search": "搜索",
  "general.filter": "筛选",
  "general.create": "创建",
  "general.select": "选择",
  "general.open": "打开",
  "general.copy": "复制",
  "general.copied": "已复制",
  "general.noResults": "无结果",
  "general.confirm": "确认",
  "general.name": "名称",
  "general.path": "路径",

  // App shell / sidebar
  "app.settings": "设置",
  "app.newSession": "新会话",
  "app.hideSidebar": "隐藏侧边栏",
  "app.showSidebar": "显示侧边栏",
  "app.fullHistory": "完整历史",
  "app.systemPrompt": "系统提示词",
  "app.systemPromptEmpty": "系统提示词为空（工具已禁用）",
  "app.systemPromptLoading": "发送消息以加载系统提示词",
  "app.sessionInfo": "会话信息",
  "app.sessionInfoSendFirst": "发送消息或运行 /session 加载会话信息",
  "app.workspace": "工作区",
  "app.workspaceCount": "工作区",
  "app.newWorkspace": "新建工作区",
  "app.selectWorkspace": "选择工作区...",
  "app.recentSessions": "最近会话",
  "app.noSessions": "未找到会话",
  "app.refreshSessions": "刷新会话列表",
  "app.refreshExplorer": "刷新文件浏览器",
  "app.explorer": "文件浏览器",
  "app.chooseFolder": "选择文件夹...",
  "app.useDefaultDir": "使用默认目录",
  "app.filterProjects": "筛选项目...",
  "app.noMatchingProjects": "无匹配项目",
  "app.loadingFolders": "加载文件夹中...",
  "app.noSubfolders": "此文件夹没有子文件夹。",
  "app.selectProjectFolder": "选择项目文件夹",
  "app.browseAccessibleFolder": "浏览可访问的文件夹。",
  "app.workspaceFolderName": "工作区文件夹名称",
  "app.creating": "创建中...",
  "app.removeWorkspace": "移除工作区",
  "app.removeWorkspaceConfirm": '从工作区中移除"${path}"？',
  "app.selecting": "选择中...",

  // Navigation & Sidebar
  "nav.skills": "Skills",
  "nav.mcp": "MCP",
  "nav.packs": "Packs",
  "nav.plugins": "Plugins",
  "nav.newSession": "新会话",

  // Settings modal
  "settings.title": "设置",
  "settings.general": "通用",
  "settings.models": "Models",
  "settings.language": "语言",
  "settings.theme": "主题",
  "settings.light": "浅色",
  "settings.dark": "深色",
  "settings.eyeComfort": "护眼",
  "settings.switchToLight": "切换至浅色模式",
  "settings.switchToDark": "切换至深色模式",
  "settings.switchToEye": "切换至护眼模式",
  "settings.languageDescription": "选择界面显示语言。部分专业术语将保持英文。",

  // Models config
  "models.title": "Models",
  "models.configFile": "~/.pi/agent/models.json",
  "models.addProvider": "+ 添加 Provider",
  "models.selectProviderOrModel": "选择一个 Provider 或 Model",
  "models.loading": "加载中…",
  "models.save": "保存",
  "models.saving": "保存中…",
  "models.saved": "已保存",
  "models.cancel": "取消",

  // Skills config
  "skills.title": "Skills",

  // MCP config
  "mcp.title": "MCP",

  // Packs config
  "packs.title": "Packs",

  // Plugins config
  "plugins.title": "Plugins",

  // Chat / Messages
  "chat.sendMessage": "发送消息给 Agent...",
  "chat.thinking": "思考中...",
  "chat.toolCall": "工具调用",
  "chat.toolResult": "工具结果",
  "chat.typeMessage": "输入消息...",
  "chat.uploadFile": "上传文件",
  "chat.collapseDetails": "收起详情",
  "chat.expandDetails": "展开详情",
  "chat.stopGeneration": "停止生成",
  "chat.regenerate": "重新生成",
  "chat.model": "模型",
  "chat.thinkingLevel": "思考级别",
  "chat.tools": "工具",
  "chat.compact": "压缩",
  "chat.newSessionCreated": "新会话已创建",

  // Session info
  "session.info": "会话信息",
  "session.name": "名称",
  "session.file": "文件",
  "session.id": "ID",
  "session.messages": "消息",
  "session.user": "用户",
  "session.assistant": "Assistant",
  "session.toolCalls": "工具调用",
  "session.toolResults": "工具结果",
  "session.total": "总计",
  "session.tokens": "Tokens",
  "session.input": "输入",
  "session.output": "输出",
  "session.cacheRead": "缓存读取",
  "session.cacheWrite": "缓存写入",
  "session.cacheHit": "缓存命中率",
  "session.cost": "费用",
  "session.context": "上下文",
  "session.unknown": "未知",
  "session.copyFilePath": "复制文件路径",
  "session.copySessionId": "复制会话 ID",
  "session.noName": "未命名",

  // Git / Review
  "review.changes": "变更",
  "review.history": "历史",
  "review.branch": "分支",
  "review.unified": "统一视图",
  "review.split": "分栏视图",
  "review.noChanges": "无变更",
  "review.commits": "提交",
  "review.commit": "提交",
  "review.files": "文件",
  "review.file": "文件",
  "review.stats": "统计",

  // File tree
  "fileTree.title": "文件树",
  "fileTree.noFiles": "无文件",
  "fileTree.hideHidden": "隐藏隐藏文件",
  "fileTree.showHidden": "显示隐藏文件",

  // Terminal
  "terminal.title": "终端",
  "terminal.newTerminal": "新建终端",
  "terminal.noTerminal": "无终端会话",

  // Unused / session actions
  "session.messagesCount": "${count} 条消息",
  "session.justNow": "刚刚",
  "session.minutesAgo": "${count}分钟前",
  "session.hoursAgo": "${count}小时前",
  "session.daysAgo": "${count}天前",
  "session.expandForks": "展开分支",
  "session.collapseForks": "收起分支",
  "session.deleteConfirm": '删除"${title}"？',
  "session.deleteBtn": "删除",
  "session.cancelBtn": "取消",
};

export default zh;
