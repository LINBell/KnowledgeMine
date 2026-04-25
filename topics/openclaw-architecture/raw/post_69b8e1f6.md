# 终于搞明白了openclaw的memory架构

> 作者：momo | 点赞：371 | 收藏：605 | 评论：7

## 正文核心内容

**⭐ 这是关于 OpenClaw Memory 架构最清晰的技术解析**

### 双层记忆系统

1. **Agent 层（MEMORY.md）**：存长期事实和用户偏好
2. **日志层（memory/YYYY-MM-DD.md）**：存每天运行总结

两层都是 **append-only**（只追加不修改）。

### Session 加载策略

每个 session 开始时，OpenClaw 会加载：
- Agent 层的记忆（MEMORY.md）
- 最近两天的日志

### 记忆更新机制（Store）

触发记忆存储的三种情况：
1. 用户显式说"记住这个"
2. 模型自己判断需要记住
3. 上下文快满时，compaction 之前会将重要内容存到日志

### 记忆检索机制（Load）

- **memory_search**：查询 memory markdown snippet 的索引（SQLite 索引，支持向量相似度 + 关键词 BM25）
- **memory_get**：读取对应文件的对应行
- 日志有 **temporal decay**（时间衰减），文件重要性有约 30 天的半衰期

### 易混淆的关键点

- **Agent 的记忆 ≠ Session 的状态**
- Session 状态通过 `sessions.json` 和 `sessionId.jsonl` 保存
- 目的是让 session 中断后能用之前的上下文继续，而非重新开始
- Compaction 压缩的上下文存在 `.jsonl` 里，不是 memory
- 但压缩之前，memory 会主动更新一次

## 评论区补充知识

- "不是双层，是4层"——@Jasper（指出文章简化了记忆层级）
- 有人问 compaction 存在 jsonl 的内容和 memory 之间的关联

## 个人评注

- 这是小红书上关于 OpenClaw Memory 架构最技术深度的帖子
- 源码级分析，含 SQLite 索引、BM25、向量相似度等实现细节
- 双层→四层的争论说明架构比文章描述的更复杂
- temporal decay（30天半衰期）是重要的工程细节
