import Link from "next/link";
import { SEO_PAGES } from "@/lib/seo/pages";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcademicHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Academic Writing Hub</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guides, tools, and resources for dissertation writing, research proposals, and literature reviews.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SEO_PAGES.map((page) => (
          <Card key={page.slug} className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-base">{page.title}</CardTitle>
              <CardDescription className="line-clamp-2">{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/academic/${page.slug}`}>
                <Button variant="outline" size="sm" className="w-full">Read Guide</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
