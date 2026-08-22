import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "猫チャット",
    short_name: "猫チャット",
    description: "猫の表情と一言で、グループの近況を共有するチャットアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#fffefd",
    theme_color: "#e0b369",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/app-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/app-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/app-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
