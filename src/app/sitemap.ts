import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data: camisas } = await supabase
    .from("camisas")
    .select("id, created_at")
    .eq("ativo", true);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...(camisas ?? []).map((c) => ({
      url: `${siteUrl}/produto/${c.id}`,
      lastModified: new Date(c.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
