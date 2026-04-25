"use client";

import { useState } from "react";
import Link from "next/link";
import type { TopicMeta } from "@/lib/topics";

interface Props {
  slug: string;
  meta: TopicMeta;
  integratedHtml: string;
  rawPosts: { slug: string; content: string; html: string }[];
}

export default function TopicDetailClient({
  slug,
  meta,
  integratedHtml,
  rawPosts,
}: Props) {
  const [activeTab, setActiveTab] = useState<"integrated" | "raw">(
    "integrated"
  );
  const [selectedRaw, setSelectedRaw] = useState<string | null>(
    rawPosts[0]?.slug || null
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/20 to-cyan-950/10" />
        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-12">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="transition hover:text-gray-300">
              首页
            </Link>
            <span>/</span>
            <span className="text-gray-300">{meta.topic}</span>
          </div>

          <h1 className="text-3xl font-bold text-white">{meta.topic}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>📅 {meta.created_at}</span>
            <span>📄 {meta.posts?.length || 0} 篇帖子</span>
            <span>
              🔍{" "}
              {meta.search_keywords?.map((k) => (
                <span
                  key={k}
                  className="mr-1.5 inline-block rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400"
                >
                  {k}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab Switcher */}
        <div className="mb-8 flex gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-1 w-fit">
          <button
            onClick={() => setActiveTab("integrated")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "integrated"
                ? "bg-violet-600/20 text-violet-300"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📋 知识整合
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "raw"
                ? "bg-violet-600/20 text-violet-300"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📑 原始分析 ({rawPosts.length})
          </button>
        </div>

        {/* Integrated View */}
        {activeTab === "integrated" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <article
              className="prose-dark min-w-0"
              dangerouslySetInnerHTML={{ __html: integratedHtml }}
            />
            <aside className="hidden lg:block">
              <div className="sticky top-20 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-300">
                  参考来源
                </h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  {meta.posts?.map((p) => (
                    <li key={p.note_id} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-violet-400">
                        •
                      </span>
                      <span className="line-clamp-2">
                        {p.title}{" "}
                        <span className="text-gray-600">
                          (👍 {p.likes})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* Raw Posts View */}
        {activeTab === "raw" && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* Post List Sidebar */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
                帖子列表
              </h3>
              <ul className="space-y-1">
                {rawPosts.map((rp) => {
                  const title = rp.content
                    .split("\n")
                    .find((l) => l.startsWith("# "))
                    ?.replace("# ", "")
                    ?.substring(0, 30) || rp.slug;
                  return (
                    <li key={rp.slug}>
                      <button
                        onClick={() => setSelectedRaw(rp.slug)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          selectedRaw === rp.slug
                            ? "bg-violet-600/15 text-violet-300"
                            : "text-gray-400 hover:bg-white/[0.03] hover:text-gray-200"
                        }`}
                      >
                        <span className="line-clamp-2">{title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Post Content */}
            <div className="min-w-0">
              {selectedRaw ? (
                <article
                  className="prose-dark"
                  dangerouslySetInnerHTML={{
                    __html:
                      rawPosts.find((rp) => rp.slug === selectedRaw)?.html ||
                      "",
                  }}
                />
              ) : (
                <p className="text-gray-500">选择一篇帖子查看</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
