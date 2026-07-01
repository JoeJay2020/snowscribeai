import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_PAGES, getSEOPage, getSEOMetadata } from "@/lib/seo/pages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getSEOMetadata(slug) ?? {};
}

export default async function AcademicSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSEOPage(slug);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `https://snowscribe.ai/academic/${page.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">{page.h1}</h1>
        <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
          {page.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <Card className="mt-10 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <p className="font-medium">Ready to try it?</p>
            <Link href={page.cta.href}>
              <Button size="lg">{page.cta.label}</Button>
            </Link>
          </CardContent>
        </Card>
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
          <ul className="space-y-2">
            {SEO_PAGES.filter((p) => p.slug !== slug)
              .slice(0, 4)
              .map((p) => (
                <li key={p.slug}>
                  <Link href={`/academic/${p.slug}`} className="text-primary hover:underline text-sm">
                    {p.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </article>
    </>
  );
}
