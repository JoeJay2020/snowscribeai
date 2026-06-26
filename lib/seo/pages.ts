import { APP_NAME } from "@/lib/constants";

export interface SEOPage {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  content: string[];
  cta: { label: string; href: string };
  relatedTool?: string;
}

export const SEO_PAGES: SEOPage[] = [
  {
    slug: "dissertation-writing",
    title: "AI Dissertation Writing Assistant",
    description: "Get chapter-by-chapter dissertation help with SnowScribe.ai. Generate introductions, literature reviews, methodology, and more.",
    keywords: ["dissertation writing", "dissertation help", "thesis assistant", "PhD writing"],
    h1: "AI Dissertation Writing Assistant",
    content: [
      "Writing a dissertation is one of the most demanding tasks in academia. SnowScribe.ai's Dissertation Assistant helps you generate structured, academically rigorous chapter drafts tailored to your research topic.",
      "Whether you're working on your introduction, literature review, methodology, or discussion chapter, our AI understands academic conventions and produces content at Masters and PhD level.",
      "Unlike generic writing tools, SnowScribe specializes in the research workflow — from proposal to defense.",
    ],
    cta: { label: "Try Dissertation Assistant", href: "/tools/dissertation" },
    relatedTool: "dissertation",
  },
  {
    slug: "research-proposal-writing",
    title: "Research Proposal Generator — Write Proposals in Minutes",
    description: "Generate complete research proposals with problem statements, objectives, methodology, and timelines using AI.",
    keywords: ["research proposal", "proposal writing", "research proposal generator", "academic proposal"],
    h1: "Research Proposal Generator",
    content: [
      "A strong research proposal is the foundation of any successful thesis or dissertation. SnowScribe.ai generates comprehensive proposals including abstract, problem statement, objectives, methodology, timeline, and budget.",
      "Designed for students at African universities and international institutions, our tool follows APA academic standards and produces submission-ready drafts.",
    ],
    cta: { label: "Generate Your Proposal", href: "/tools/research-proposal" },
    relatedTool: "research-proposal",
  },
  {
    slug: "literature-review-assistance",
    title: "Literature Review Generator for Students & Researchers",
    description: "Synthesize academic literature into structured thematic reviews with proper citations and gap analysis.",
    keywords: ["literature review", "literature review generator", "systematic review", "academic review"],
    h1: "Literature Review Generator",
    content: [
      "Literature reviews require critical synthesis — not just summarizing studies one by one. SnowScribe.ai analyzes your topic thematically, identifies research gaps, and produces structured reviews suitable for thesis submission.",
      "Our AI identifies key themes, compares methodologies, and highlights contradictions in the literature — saving weeks of reading and writing time.",
    ],
    cta: { label: "Generate Literature Review", href: "/tools/literature-review" },
    relatedTool: "literature-review",
  },
  {
    slug: "ai-paraphrasing",
    title: "AI Paraphrasing Tool for Academic Writing",
    description: "Paraphrase academic text while maintaining meaning. Perfect for avoiding plagiarism and improving clarity.",
    keywords: ["AI paraphrasing", "paraphrase tool", "academic paraphrasing", "rewrite text"],
    h1: "AI Paraphrasing for Academic Writing",
    content: [
      "SnowScribe.ai's paraphrasing tool rewrites your text in academic, professional, or formal tone while preserving the original meaning. Ideal for improving clarity in your thesis or research paper.",
      "Uses intelligent AI routing to pick the most cost-efficient model for simple rewriting tasks.",
    ],
    cta: { label: "Try Paraphrase Tool", href: "/tools/paraphrase" },
    relatedTool: "paraphrase",
  },
  {
    slug: "grammar-correction",
    title: "AI Grammar Checker for Academic Papers",
    description: "Fix grammar, spelling, and punctuation in your academic writing with SnowScribe.ai.",
    keywords: ["grammar checker", "grammar correction", "academic grammar", "proofreading AI"],
    h1: "Grammar Checker for Academic Writing",
    content: [
      "Polish your academic writing with SnowScribe's AI grammar checker. It identifies and corrects grammar, spelling, and punctuation errors while explaining key changes.",
      "Affordable at just 2 credits per check — far cheaper than human proofreading for draft-stage work.",
    ],
    cta: { label: "Check Grammar", href: "/tools/grammar" },
    relatedTool: "grammar",
  },
  {
    slug: "academic-referencing",
    title: "Academic Referencing & Citation Tools",
    description: "Format citations in APA, Harvard, IEEE, and Chicago styles. Free citation formatter included.",
    keywords: ["APA referencing", "Harvard citation", "IEEE format", "citation generator"],
    h1: "Academic Referencing Tools",
    content: [
      "Proper referencing is essential in academic writing. SnowScribe.ai offers a free citation formatter for APA, Harvard, IEEE, and Chicago styles — no credits required.",
      "For complex reference lists in your literature review or dissertation, our AI tools integrate citations directly into generated content.",
    ],
    cta: { label: "Format Citations Free", href: "/utilities/citation-formatter" },
  },
];

export function getSEOPage(slug: string): SEOPage | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

export function getSEOMetadata(slug: string) {
  const page = getSEOPage(slug);
  if (!page) return null;
  return {
    title: `${page.title} | ${APP_NAME}`,
    description: page.description,
    keywords: page.keywords.join(", "),
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: APP_NAME,
    },
  };
}
