import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Type Mandarin — 汉字打字测试",
  description:
    "Practice typing Mandarin paragraphs at HSK 1–6. See accuracy, characters per minute, and optional pinyin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
