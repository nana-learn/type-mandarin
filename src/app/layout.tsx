import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Type Mandarin — 汉字打字测试",
  description:
    "Practice typing Mandarin paragraphs at HSK 1–6. See accuracy, characters per minute, and optional pinyin.",
  applicationName: "Type Mandarin",
  appleWebApp: {
    capable: true,
    title: "汉字打字",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0b0a",
  interactiveWidget: "resizes-content",
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
