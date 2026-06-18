import { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { getServedLandingSlugs } from "@/lib/landing";

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

  // Landing pages: published DB rows + bundled seed pages (falls back to seed)
  // Pair NL↔DE landing pages so each entry carries hreflang alternates.
  const NL_DE_PAIRS: Record<string, string> = {
    "vakantiehuis-met-hottub-drenthe": "de/ferienhaus-mit-whirlpool-drenthe",
    "luxe-lodge-drenthe": "de/luxus-lodge-drenthe",
    "wellness-vakantie-drenthe": "de/wellness-urlaub-drenthe",
    "romantisch-weekend-weg-drenthe": "de/romantisches-wochenende-drenthe",
  };
  const DE_NL_PAIRS = Object.fromEntries(
    Object.entries(NL_DE_PAIRS).map(([nl, de]) => [de, nl]),
  );

  let landingPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getServedLandingSlugs();
    const slugSet = new Set(slugs);
    landingPages = slugs.map((slug) => {
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/${slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: slug.startsWith("de/") ? 0.85 : 0.9,
      };
      const nlPair = DE_NL_PAIRS[slug];
      const dePair = NL_DE_PAIRS[slug];
      if (nlPair && slugSet.has(nlPair)) {
        entry.alternates = {
          languages: { de: `${SITE_URL}/${slug}`, nl: `${SITE_URL}/${nlPair}` },
        };
      } else if (dePair && slugSet.has(dePair)) {
        entry.alternates = {
          languages: { nl: `${SITE_URL}/${slug}`, de: `${SITE_URL}/${dePair}` },
        };
      }
      return entry;
    });
  } catch {
    // ignore — sitemap still serves the rest
  }

  return [...staticPages, ...landingPages, ...blogPosts];
}
