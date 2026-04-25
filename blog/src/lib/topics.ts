import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const TOPICS_DIR = path.join(process.cwd(), "..", "topics");

export interface TopicMeta {
  topic: string;
  created_at: string;
  search_keywords: string[];
  posts: {
    note_id: string;
    title: string;
    author: string;
    likes: number;
    collects: number;
    comments_count: number;
    analyzed: boolean;
  }[];
  status: string;
}

export interface TopicData {
  slug: string;
  meta: TopicMeta;
  integratedContent: string;
  integratedHtml: string;
  rawPosts: { slug: string; content: string; html: string }[];
}

function getTopicDirs(): string[] {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function getAllTopics(): { slug: string; meta: TopicMeta }[] {
  const dirs = getTopicDirs();
  return dirs
    .map((slug) => {
      const metaPath = path.join(TOPICS_DIR, slug, "meta.json");
      if (!fs.existsSync(metaPath)) return null;
      const meta: TopicMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      return { slug, meta };
    })
    .filter(Boolean) as { slug: string; meta: TopicMeta }[];
}

export async function getTopicBySlug(
  slug: string
): Promise<TopicData | null> {
  const topicDir = path.join(TOPICS_DIR, slug);
  if (!fs.existsSync(topicDir)) return null;

  const metaPath = path.join(topicDir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  const meta: TopicMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

  // Read integrated.md
  const integratedPath = path.join(topicDir, "integrated.md");
  let integratedContent = "";
  let integratedHtml = "";
  if (fs.existsSync(integratedPath)) {
    integratedContent = fs.readFileSync(integratedPath, "utf-8");
    integratedHtml = await markdownToHtml(integratedContent);
  }

  // Read raw posts
  const rawDir = path.join(topicDir, "raw");
  let rawPosts: { slug: string; content: string; html: string }[] = [];
  if (fs.existsSync(rawDir)) {
    const files = fs.readdirSync(rawDir).filter((f) => f.endsWith(".md"));
    rawPosts = await Promise.all(
      files.map(async (f) => {
        const content = fs.readFileSync(path.join(rawDir, f), "utf-8");
        const htmlContent = await markdownToHtml(content);
        return { slug: f.replace(".md", ""), content, html: htmlContent };
      })
    );
  }

  return { slug, meta, integratedContent, integratedHtml, rawPosts };
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

export function getTopicStats(): {
  totalTopics: number;
  totalPosts: number;
} {
  const topics = getAllTopics();
  const totalPosts = topics.reduce(
    (sum, t) => sum + (t.meta.posts?.length || 0),
    0
  );
  return { totalTopics: topics.length, totalPosts };
}
