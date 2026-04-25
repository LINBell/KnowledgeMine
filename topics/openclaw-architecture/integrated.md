# OpenClaw 架构 知识整合

## 概述

OpenClaw 是目前 GitHub 上星标数最高的 AI Agent 开源项目（25w+ stars），其本质是一个**AI Agent 操作系统框架**——将大模型的推理能力、工具调用能力、记忆能力整合为一个可本地部署、可扩展的智能体系统。本文从架构设计、核心组件、技术实现三个维度，对小红书上高赞帖子的知识进行系统性整合。

---

## 核心知识体系

### 1. OpenClaw 是什么

**定位**：AI Agent 操作系统框架，不是一个单独的 AI 模型，而是一个让 AI 从"只会聊天"变成"会做事"的系统。

**与通用 AI 的区别**：
| 维度 | 通用 AI（ChatGPT等） | OpenClaw |
|------|---------------------|----------|
| 角色 | 顾问（只能建议） | 执行者（能直接操作你的电脑） |
| 工作模式 | 被动响应 | 主动巡检（Heartbeat）+ 定时任务（Cron） |
| 数据隐私 | 云端处理 | 本地化部署，数据不出设备 |
| 能力边界 | 只能输出文本 | 可调用 Skills 操作文件、浏览器、API 等 |

**核心公式**：OpenClaw = 大模型（大脑）+ Skills（工具箱）+ Memory（记忆体）+ Gateway（调度中心）

---

### 2. 整体架构

OpenClaw 的架构可概括为四层：

```
触发层（Trigger） → 网关层（Gateway） → Agent层（Agent） → 执行层（Skills/Memory）
```

#### 2.1 触发层（Trigger）

- **入口**：Telegram、Discord、CLI、Web UI 等多种接入方式
- **作用**：接收用户指令，传递给网关层
- **Heartbeat 机制**：主动巡检，Agent 可在无用户指令时主动运行（如检查邮件、日历提醒）

#### 2.2 网关层（Gateway）

- **核心职责**：
  - 身份验证
  - 统一消息格式
  - 串行执行（防止并发导致系统混乱）
  - 路由到对应的 Agent
- **设计哲学**：Gateway 是系统的"总调度"，确保所有操作有序执行

#### 2.3 Agent 层（Agent）

- **核心职责**：
  - 理解用户意图
  - 结合记忆（短期+长期）规划执行方案
  - 调用 Skills 执行具体任务
  - 管理上下文窗口
- **动态系统提示词**：每次执行时动态构建 system prompt，将记忆、偏好、可用工具注入
- **Subagent 机制**：主 Agent 可创建子 Agent 处理子任务

#### 2.4 执行层（Skills + Memory）

- **Skills**：可扩展的工具集，每个 Skill 是一个独立的功能模块
- **Memory**：双层记忆系统，支持持久化和检索

---

### 3. 多 Agent 架构

这是 OpenClaw 架构中最核心也最复杂的部分。

#### 3.1 架构模式

理论上的多 Agent 架构模式：
- **中心化**：一个主 Agent 调度所有子 Agent
- **去中心化**：Agent 之间平等协作
- **独立型**：各 Agent 独立运行
- **混合型**：根据场景灵活组合

**OpenClaw 实际采用**：中心化 + 工具调用的混合架构。主 Agent 是调度中心，子 Agent 作为工具被调用。

#### 3.2 Agent 通信机制

两种核心通信方式：
1. **工具调用（Tool Call）**：Agent A 把 Agent B 当作一个工具来调用，调用完成后控制权回到 A
2. **移交（Handoff）**：Agent A 把控制权转给 Agent B，B 接管后续所有交互

#### 3.3 面试高频问题

- "你的 Agent 用的是什么架构？" → 中心化+混合
- "Agent 之间如何通信？" → 工具调用 + 移交
- "如何保证多 Agent 协作的稳定性？" → Gateway 串行执行 + 容错机制

---

### 4. Memory 架构（⭐核心技术点）

这是 OpenClaw 最具技术深度的子系统，也是决定 Agent "智能程度"的关键。

#### 4.1 记忆层级

实际为**多层记忆系统**（非简单双层）：

| 层级 | 存储位置 | 内容 | 更新方式 |
|------|---------|------|---------|
| Agent 层 | MEMORY.md | 长期事实、用户偏好 | Append-only |
| 日志层 | memory/YYYY-MM-DD.md | 每日运行总结 | Append-only |
| Session 状态 | sessions.json + sessionId.jsonl | 上下文历史 | 可压缩(Compaction) |

#### 4.2 记忆存储（Store）

三种触发条件：
1. 用户显式指令："记住这个"
2. 模型自主判断需要记住
3. 上下文快满时，Compaction 前主动保存重要内容

#### 4.3 记忆检索（Load）

两个核心工具：
- **memory_search**：基于 SQLite 索引的混合检索
  - 向量相似度搜索（语义匹配）
  - BM25 关键词搜索（精确匹配）
- **memory_get**：读取指定文件的指定行

#### 4.4 时间衰减机制

- 日志层有 **temporal decay**（时间衰减）
- 文件重要性约 **30 天半衰期**：超过 30 天的日志权重逐渐降低
- Session 加载策略：只加载 MEMORY.md + 最近 2 天日志

#### 4.5 易混淆概念

- **Agent 的记忆 ≠ Session 的状态**
- Session 状态的目的是中断恢复，不是知识积累
- Compaction 压缩的是上下文（存 jsonl），不是 Memory
- 但压缩前，Memory 会主动更新一次

---

### 5. Skills 生态

#### 5.1 什么是 Skill

Skill 是 OpenClaw 的"工具箱"，每个 Skill 是一个独立的功能模块，Agent 通过工具调用机制来使用它们。

#### 5.2 核心 Skills 分类

| 类别 | 代表 Skill | 功能 |
|------|-----------|------|
| 信息检索 | WebSearch | 网络搜索 |
| 文件操作 | FileRead/FileWrite | 读写本地文件 |
| 代码执行 | CodeExecution | 生成并执行代码 |
| 浏览器控制 | BrowserControl | 操控浏览器 |
| 通信 | Email/Telegram | 发送消息 |
| 记忆 | memory_search/memory_get | 检索和读取记忆 |

#### 5.3 MCP（Model Context Protocol）

- MCP 是 OpenClaw 接入外部工具的标准协议
- 通过 MCP，任何兼容的服务都可以作为 Skill 接入
- MCP Server 提供工具描述和执行接口，Agent 通过 MCP Client 调用

---

### 6. 技术路线与关键设计

#### 6.1 上下文管理

- **核心挑战**：大模型的上下文窗口有限（通常 128K token）
- **解决方案**：Compaction（上下文压缩）
  - 当上下文接近窗口上限时，自动压缩历史对话
  - 压缩前先保存重要信息到 Memory
  - 压缩后的摘要存入 .jsonl，不是 Memory

#### 6.2 动态系统提示词

- 每次执行时动态构建 system prompt
- 注入内容：用户偏好、可用工具列表、历史记忆摘要
- 这是"决定 Agent 上限"的关键设计

#### 6.3 本地化部署

- 所有数据在本地处理（隐私优势）
- 支持 Docker 一键部署
- 依赖：Node.js + SQLite + 本地大模型或 API 调用

---

## 实践建议

1. **入门路径**：先理解 Skill→MCP→Agent→OpenClaw 四层概念，再深入 Memory 和多 Agent 机制
2. **架构理解的优先级**：Gateway > Agent > Memory > Skills > Trigger
3. **工程落地的重点**：不是架构设计，而是连接、权限、容错、接口、流程编排、稳定性、反馈机制和责任边界
4. **Memory 优化方向**：结合 Obsidian 等外部知识库扩展长期记忆，利用 temporal decay 平衡记忆的新鲜度和完整性
5. **多 Agent 实践**：从中心化架构开始，逐步引入 Subagent 处理复杂任务

## 注意事项

1. **架构图 ≠ 源码实现**：小红书上的架构图多为简化版，与实际代码有差异，深度开发需要阅读源码
2. **Memory 不是简单的双层**：实际是多层系统，Agent 层/日志层/Session 层各有职责
3. **不要被设备党带偏**：OpenClaw 的价值在于架构设计和记忆机制，不是 Skill 数量
4. **本地部署有成本**：Token 消耗是主要开销，需要合理配置模型和调用策略
5. **4.12 更新**：Memory 机制已有重大升级（"终于好用"），关注最新版本的改进

## 参考来源

- [一口气拆穿Skill/MCP/Agent/OpenClaw原理](https://xiaohongshu.com) - 点赞 58990，收藏 73494
- [一篇讲明白 OpenClaw 原理和Agent架构](https://xiaohongshu.com) - 点赞 552，收藏 697
- [一文硬核拆解OpenClaw底层原理！](https://xiaohongshu.com) - 点赞 533，收藏 746
- [怎么理解openclaw架构，该做哪些改造](https://xiaohongshu.com) - 点赞 640，收藏 976
- [从OpenClaw多Agent架构拆解面试问题](https://xiaohongshu.com) - 点赞 730，收藏 901
- [终于搞明白了openclaw的memory架构](https://xiaohongshu.com) - 点赞 371，收藏 605
- [给技术小白的OpenClaw核心架构及运转原理](https://xiaohongshu.com) - 点赞 3196，收藏 5326
- [面试官：OpenClaw这么火，知道它的原理吗？](https://xiaohongshu.com) - 点赞 1672，收藏 2494
- [OpenClaw必装15个Skills](https://xiaohongshu.com) - 点赞 1582，收藏 2239
- [每日产品3分钟｜什么是OpenClaw？](https://xiaohongshu.com) - 点赞 1165，收藏 869
- [OpenClaw进阶攻略：技能矩阵到手搓工作流](https://xiaohongshu.com) - 点赞 912，收藏 1779
- [不了解 memory，你就不可能养好 Agent](https://xiaohongshu.com) - 点赞 849，收藏 1608
- [openclaw的memory源码级解析](https://xiaohongshu.com) - 点赞 215，收藏 386
- [OpenClaw记忆架构全解析](https://xiaohongshu.com) - 点赞 122，收藏 250
- [OpenClaw和Hermes架构拆解](https://xiaohongshu.com) - 点赞 21，收藏 32
