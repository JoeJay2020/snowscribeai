import Link from "next/link";
import { Snowflake } from "lucide-react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Snowflake className="h-4 w-4" />
              </div>
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered academic writing and research assistance for students and professionals worldwide.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Academic Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/research-proposal" className="hover:text-foreground transition-colors">Research Proposal</Link></li>
              <li><Link href="/tools/literature-review" className="hover:text-foreground transition-colors">Literature Review</Link></li>
              <li><Link href="/tools/dissertation" className="hover:text-foreground transition-colors">Dissertation Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">SEO Guides</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/academic/dissertation-writing" className="hover:text-foreground transition-colors">Dissertation Writing</Link></li>
              <li><Link href="/academic/research-proposal-writing" className="hover:text-foreground transition-colors">Research Proposals</Link></li>
              <li><Link href="/academic/literature-review-assistance" className="hover:text-foreground transition-colors">Literature Reviews</Link></li>
              <li><Link href="/utilities" className="hover:text-foreground transition-colors">Free Utilities</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
