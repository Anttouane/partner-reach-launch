import { Instagram, Youtube, Music2 } from "lucide-react";

export const networkIcon = (n?: string | null) =>
  n === "youtube" ? Youtube : n === "tiktok" ? Music2 : Instagram;

export const networkLabel = (n?: string | null) =>
  n === "youtube" ? "YouTube" : n === "tiktok" ? "TikTok" : "Instagram";

export const compact = (n?: number | null) =>
  n == null ? "—" : n.toLocaleString("fr-FR");
