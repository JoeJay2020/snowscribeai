import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo/pages";
import { UTILITY_TOOLS } from "@/lib/utilities/text-tools";
import { getAllTools } from "@/lib/tools";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://snowscribe.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/academic", "/utilities", "/login", "/register"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const seoPages = SEO_PAGES.map((page) => ({
    url: `${BASE_URL}/academic/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const utilityPages = UTILITY_TOOLS.map((tool) => ({
    url: `${BASE_URL}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const toolPages = getAllTools().map((tool) => ({
    url: `${BASE_URL}/tools/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...seoPages, ...utilityPages, ...toolPages];
}
