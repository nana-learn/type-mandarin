import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NODE_ENV === "production" ? "/type-mandarin" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Type Mandarin",
    short_name: "汉字打字",
    description: "Practice typing Mandarin paragraphs at HSK 1–6.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0c0b0a",
    theme_color: "#0c0b0a",
    lang: "zh-CN",
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
