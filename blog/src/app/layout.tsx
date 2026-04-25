import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KnowledgeMine - 知识矿场",
  description: "从碎片中挖掘体系，从噪音中提炼知识",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.className} bg-[#0a0a0f] text-gray-200 antialiased`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
            <a href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="text-2xl">⛏️</span>
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                KnowledgeMine
              </span>
            </a>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="/" className="transition hover:text-white">
                首页
              </a>
              <span className="h-4 w-px bg-white/10" />
              <span className="text-xs text-gray-500">私人知识库</span>
            </div>
          </div>
        </nav>
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
