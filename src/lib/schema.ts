import {
  absoluteUrl,
  CONTENT_LAST_UPDATED,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// Shared schema.org nodes. Site-wide nodes (Organization, WebSite) are emitted
// once in the root layout; pages reference them by @id instead of repeating them.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const WEBAPP_ID = `${SITE_URL}/#webapp`;

export const AUDIENCE = {
  "@type": "Audience",
  audienceType: "People preparing for the Australian citizenship test",
  geographicArea: { "@type": "Country", name: "Australia" },
};

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icons/icon-512.png"),
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-AU",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** A WebPage node for `path`, linked to the site-wide WebSite node. */
export function webPage(path: string, name: string, description: string, extra: Record<string, unknown> = {}) {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en-AU",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    dateModified: CONTENT_LAST_UPDATED,
    ...extra,
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
