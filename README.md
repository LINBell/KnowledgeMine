# KnowledgeMine（知识矿场）

> 从小红书挖掘、整合、归档知识的私人系统

## 项目结构

```
D:\KnowledgeMine\
├── topics/                    # 所有 Topic 数据
│   └── {topic-name}/          # 每个 Topic 一个文件夹
│       ├── meta.json          # Topic 元数据
│       ├── raw/               # 原始帖子分析
│       │   ├── post_{note_id}.md
│       │   └── ...
│       └── integrated.md      # 整合后的系统知识文档
├── blog/                      # Next.js 博客网站
├── templates/                 # MD 模板
├── scripts/                   # 辅助脚本
└── README.md
```

## 工作流

1. **搜索筛选**：在小红书按点赞/收藏排序搜索，筛选 ≥10 篇高质量帖子
2. **逐帖分析**：提取正文+评论区知识，生成单篇 MD
3. **知识整合**：求同存异，生成体系化 `integrated.md`
4. **小红书发布**：私密发布（仅自己可见，不带标签）
5. **博客展示**：Next.js 深色极简知识库

## 技术栈

- 小红书 API：xiaohongshu-mcp
- 博客：Next.js + TypeScript + Tailwind CSS
- 封面图：纯色/渐变背景+标题文字模板
