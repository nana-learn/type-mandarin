import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Type Mandarin — 汉字打字测试",
  description:
    "A one-minute Mandarin typing test. Type the paragraph with your Chinese IME and see CPM and accuracy.",
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
