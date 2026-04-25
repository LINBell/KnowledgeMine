import { getTopicBySlug, getAllTopics } from "@/lib/topics";
import { notFound } from "next/navigation";
import TopicDetailClient from "./TopicDetailClient";

export async function generateStaticParams() {
  const topics = getAllTopics();
  return topics.map((t) => ({ slug: t.slug }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  return (
    <TopicDetailClient
      slug={topic.slug}
      meta={topic.meta}
      integratedHtml={topic.integratedHtml}
      rawPosts={topic.rawPosts}
    />
  );
}
