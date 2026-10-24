import { AUTHOR } from "@/data/authors";

export const SITE_URL = "https://www.dbdiagramr.space";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/about#person`;
export const PERSON_URL = `${SITE_URL}/about`;

export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR.name,
    url: PERSON_URL,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.bio,
    sameAs: [...AUTHOR.sameAs],
  };
}

export function organizationRef() {
  return { "@id": ORGANIZATION_ID };
}

export function breadcrumbNode(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webApplicationNode({
  name,
  description,
  url,
  image = `${SITE_URL}/DbDiagramr-OG.png`,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name,
    url,
    description,
    image,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: personNode(),
    publisher: organizationRef(),
  };
}
