import { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

const SITE_URL = "https://www.huisterhuynen.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          nl: SITE_URL,
          de: `${SITE_URL}/de`,
        },
      },
    },
    {
      url: `${SITE_URL}/de`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          nl: SITE_URL,
          de: `${SITE_URL}/de`,
        },
      },
    },
    {
      url: `${SITE_URL}/omgeving`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/datenschutz`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/impressum`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/agb`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/welkom`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamically include all published blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("slug, gepubliceerd_op")
      .eq("gepubliceerd", true)
      .order("gepubliceerd_op", { ascending: false });

    if (data) {
      blogPosts = data.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.gepubliceerd_op ? new Date(post.gepubliceerd_op) : lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Static pages still served if Supabase is unavailable during build
  }

  return [...staticPages, ...blogPosts];
}
