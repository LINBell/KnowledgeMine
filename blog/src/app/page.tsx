import Link from "next/link";
import { getAllTopics, getTopicStats } from "@/lib/topics";

export default function Home() {
  const topics = getAllTopics();
  const stats = getTopicStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-40 right-1/4 h-56 w-56 rounded-full bg-cyan-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-24">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              KnowledgeMine
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            从碎片中挖掘体系，从噪音中提炼知识
          </p>
          <div className="mt-6 flex gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                {stats.totalTopics}
              </span>
              <span className="text-gray-500">主题</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                {stats.totalPosts}
              </span>
              <span className="text-gray-500">帖子分析</span>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg">还没有知识主题</p>
            <p className="text-sm mt-2">
              给一个 Topic，开始你的知识挖掘之旅
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ slug, meta }) => (
              <Link
                key={slug}
                href={`/topic/${slug}`}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.04]"
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600/0 to-cyan-600/0 opacity-0 transition-opacity duration-300 group-hover:opacity-20 blur-xl" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                      {meta.topic}
                    </h2>
                    <span className="shrink-0 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-400">
                      {meta.status === "completed" ? "已完成" : "进行中"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {meta.search_keywords?.join("、") || "无关键词"}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>📄 {meta.posts?.length || 0} 篇帖子</span>
                    <span>📅 {meta.created_at}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
