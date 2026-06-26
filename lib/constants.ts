export const APP_NAME = "SnowScribe.ai";
export const APP_DESCRIPTION =
  "AI-powered academic writing, research assistance, and dissertation tools for students, researchers, and professionals across Africa and beyond.";

export const SESSION_COOKIE_NAME = "snowscribe_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    monthlyCredits: 50,
    dailyLimit: 10,
    features: [
      "50 credits/month",
      "Basic AI models",
      "Word counter & text tools",
      "10 requests/day",
    ],
  },
  STUDENT: {
    id: "student",
    name: "Student",
    price: 4.99,
    monthlyCredits: 500,
    dailyLimit: 50,
    features: [
      "500 credits/month",
      "Academic research tools",
      "Research proposal generator",
      "Citation formatting",
      "Export to PDF & DOCX",
    ],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 14.99,
    monthlyCredits: 2000,
    dailyLimit: 200,
    features: [
      "2,000 credits/month",
      "Premium AI models",
      "Literature review generator",
      "Dissertation assistant",
      "Priority processing",
      "Unlimited exports",
    ],
  },
  BUSINESS: {
    id: "business",
    name: "Business",
    price: 49.99,
    monthlyCredits: 10000,
    dailyLimit: 1000,
    features: [
      "10,000 credits/month",
      "Team workspaces",
      "Shared documents",
      "API access",
      "Admin dashboard",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    monthlyCredits: null,
    dailyLimit: null,
    features: [
      "Custom credit allocation",
      "White-label options",
      "Dedicated resources",
      "SLA guarantee",
      "Custom integrations",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const CREDIT_COSTS = {
  GRAMMAR_CHECK: 2,
  PARAPHRASE: 3,
  BASIC_REWRITE: 2,
  TONE_ADJUST: 3,
  SUMMARIZE: 10,
  ARTICLE_REWRITE: 15,
  BLOG_GENERATE: 20,
  SEO_OPTIMIZE: 15,
  RESEARCH_ASSISTANT: 15,
  RESEARCH_PROPOSAL: 25,
  LITERATURE_REVIEW: 50,
  DISSERTATION_SECTION: 100,
  THESIS_ASSISTANT: 75,
  CITATION_FORMAT: 0,
} as const;

export const FLAGSHIP_TOOLS = [
  {
    id: "research-proposal",
    name: "Research Proposal Generator",
    description:
      "Generate comprehensive research proposals with problem statements, objectives, methodology, and timelines.",
    credits: CREDIT_COSTS.RESEARCH_PROPOSAL,
    href: "/tools/research-proposal",
    icon: "FileText",
    featured: true,
  },
  {
    id: "literature-review",
    name: "Literature Review Generator",
    description:
      "Synthesize academic literature into structured reviews with proper citations and thematic analysis.",
    credits: CREDIT_COSTS.LITERATURE_REVIEW,
    href: "/tools/literature-review",
    icon: "BookOpen",
    featured: true,
  },
  {
    id: "dissertation",
    name: "Dissertation Assistant",
    description:
      "Get chapter-by-chapter guidance for your dissertation — from introduction to conclusion.",
    credits: CREDIT_COSTS.DISSERTATION_SECTION,
    href: "/tools/dissertation",
    icon: "GraduationCap",
    featured: true,
  },
] as const;

export const NAV_LINKS = [
  { label: "Tools", href: "/tools" },
  { label: "Pricing", href: "/pricing" },
  { label: "Academic Hub", href: "/academic" },
  { label: "Utilities", href: "/utilities" },
] as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/tools",
  "/workspace",
  "/assistant",
  "/admin",
  "/billing",
];
export const AUTH_ROUTES = ["/login", "/register"];
