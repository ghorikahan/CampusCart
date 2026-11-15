import { redirect } from "next/navigation";

interface ListingsRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsRedirectPage({ searchParams }: ListingsRedirectProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        val.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, val);
      }
    }
  }

  const queryString = urlParams.toString();
  redirect(queryString ? `/browse?${queryString}` : "/browse");
}

