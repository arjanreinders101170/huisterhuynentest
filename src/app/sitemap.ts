import { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";
import { getServedLandingPages } from "@/lib/landing";
import { REDIRECTED_BLOG_SLUGS } from "@/lib/redirects";

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
  ];

  // Bewust niet in de sitemap: /privacy, /terms, /datenschutz, /impressum, /agb
  // en /welkom. De rechtspagina's staan op noindex (zie hun layout.tsx) en
  // /welkom hangt aan een persoonlijke gastlink. Een pagina die je zelf
  // aanmeldt en vervolgens op noindex zet, geeft een tegenstrijdig signaal —
  // en Google blijft hem crawlen zolang hij in de sitemap staat.

  // Dynamically include all published blog posts
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("slug, gepubliceerd_op")
      .eq("gepubliceerd", true)
      .order("gepubliceerd_op", { ascending: false });

    if (data) {
      // 301'd blogs horen niet meer in de sitemap: anders blijft Google ze
      // crawlen en blijft de kannibalisatie in de index staan.
      blogPosts = data
        .filter((post) => !REDIRECTED_BLOG_SLUGS.has(post.slug))
        .map((post) => ({
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
    const pages = await getServedLandingPages();
    const slugSet = new Set(pages.map((p) => p.slug));
    landingPages = pages.map(({ slug, updatedAt }) => {
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/${slug}`,
        // De echte wijzigingsdatum, niet het moment van crawlen: een lastmod
        // die voor elke pagina "nu" zegt, wordt door Google als ruis
        // behandeld en dan telt hij ook niet meer mee voor de pagina die
        // wél net is herschreven. Weten we de datum niet, dan laten we het
        // veld weg — een ontbrekende lastmod is neutraal, een onjuiste niet.
        ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
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
