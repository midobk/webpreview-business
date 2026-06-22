/**
 * Outreach Email Template System
 * ------------------------------
 * 4 A/B-tested email angle templates, a contact-safety gate validator,
 * and an email-body generator. No actual sending happens here — the
 * generator only assembles subject + body + metadata ready for review
 * and an explicit send step elsewhere.
 *
 * Usage (ts-node / tsx / Next.js API route):
 *
 *   import {
 *     buildOutreach,
 *     contactSafetyGate,
 *     ANGLE_TEMPLATES,
 *     pickAngle,
 *     rotateAngle,
 *   } from "./templates";
 *
 *   const safety = contactSafetyGate(lead, prototype);
 *   if (!safety.ok) { /* skip + log *\/ }
 *   const angle = pickAngle(lead.slug);   // deterministic per lead
 *   const email = buildOutreach({ lead, prototype, angle });
 *
 *   // log email somewhere (data/outreach_logs.json), then send later.
 *
 * Rules encoded here mirror docs/OUTREACH_RULES.md and AGENT_PLAN.md
 * section 5 (Outreach Strategy).
 */

export type Industry =
  | "cleaning"
  | "auto_repair"
  | "salon"
  | "barber"
  | "restaurant"
  | "contractor"
  | "landscaper"
  | "tutor"
  | "repair_shop"
  | "school"
  | "store"
  | "trades"
  | "home_services"
  | "professional_services"
  | "other";

export type AvoidedIndustry =
  | "cannabis"
  | "alcohol"
  | "adult"
  | "political"
  | "gambling"
  | "crypto";

export interface Lead {
  id: string;
  business_name: string;
  slug: string;
  industry: Industry | string;
  city: string;
  province: string;
  country: string;
  email: string | null;
  email_source_url?: string | null;
  website_url?: string | null;
  website_status?: "none" | "broken" | "ugly" | "outdated" | "ok";
  lead_score?: number;
  contact_safety_status?: string;
  status?: string;
}

export interface Prototype {
  id: string;
  lead_id: string;
  prototype_url: string;
  screenshot_url?: string | null;
  title: string;
  watermark_enabled?: boolean;
  demo_locked?: boolean;
  showcase_eligible?: boolean;
}

export type AngleKey = "preview_made" | "deserves_better" | "helped_neighbors" | "noticed_gap";

export interface AngleTemplate {
  key: AngleKey;
  label: string;
  description: string;
  subject: (ctx: EmailContext) => string;
  body: (ctx: EmailContext) => string;
}

export interface EmailContext {
  lead: Lead;
  prototype: Prototype;
  previewBaseUrl: string;   // e.g. "https://webpreview-business.vercel.app"
  screenshotBaseUrl?: string;
  senderName: string;       // e.g. "Dexter from SiteSprint"
  senderEmail: string;      // e.g. "hello@sitesprint.example"
  unsubscribeUrl: string;   // appended to footer
  bookingUrl?: string;      // optional Cal.com / call link
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const AVOIDED_INDUSTRIES: AvoidedIndustry[] = [
  "cannabis",
  "alcohol",
  "adult",
  "political",
  "gambling",
  "crypto",
];

export const REGULATED_INDUSTRIES = ["lawyer", "doctor", "financial", "medical", "legal"];

export const MIN_LEAD_SCORE_FOR_OUTREACH = 60;

// -----------------------------------------------------------------------------
// A/B Email Angles (4 templates)
// -----------------------------------------------------------------------------

export const ANGLE_TEMPLATES: Record<AngleKey, AngleTemplate> = {
  /**
   * Angle 1 — "I made you a preview"
   * Direct, curiosity-driven, shows the artifact up front.
   * Best for: businesses with no website at all, design-strong industries.
   */
  preview_made: {
    key: "preview_made",
    label: "Preview made",
    description:
      "Direct angle: lead with the artifact. 'I made a quick preview concept for your business.'",
    subject: (ctx) =>
      `Quick website concept I made for ${ctx.lead.business_name}`,
    body: (ctx) => `Hi ${firstNameGuess(ctx.lead)},


I came across ${ctx.lead.business_name} while looking at ${ctx.lead.city} small businesses, and I went ahead and put together a quick website concept for you — just to show what a clean, modern one-pager could look like for your services.

Here's the preview:
${previewLink(ctx)}

A few notes:
- This is an unofficial preview concept — not live, not connected to your real business.
- Forms and buttons are demo-locked until the site is claimed.
- You didn't ask for this — no pressure at all. If it's not useful, just hit reply and I'll stop.

If you'd like to talk about making it real (or want me to try a different style), I'm happy to send a couple of variations or hop on a quick call.

Either way, no strings attached.

${footer(ctx, "preview_made")}`,
  },

  /**
   * Angle 2 — "Your business deserves a better online presence"
   * Benefit-led, slightly softer, doesn't reveal the prototype immediately.
   * Best for: businesses with outdated/ugly websites, professional services.
   */
  deserves_better: {
    key: "deserves_better",
    label: "Deserves better",
    description:
      "Benefit angle: frame around the gap between the business and its current online presence.",
    subject: (ctx) =>
      `${ctx.lead.business_name} deserves a better first impression online`,
    body: (ctx) => `Hi ${firstNameGuess(ctx.lead)},


I've been looking at small ${industryLabel(ctx.lead.industry)} businesses in ${ctx.lead.city}, and ${ctx.lead.business_name} kept standing out — solid services, real reputation, but the online presence doesn't quite match the work you do.

So I put together a quick one-page concept to show what that could look like. Think of it as a sketch, not a finished site.

You can see it here:
${previewLink(ctx)}

It's watermarked and demo-only — no fake claims, no real bookings being taken. Just a visual preview to see if the direction feels right for you.

If you'd like me to tweak it, scrap it, or build it for real, just reply and tell me what you'd change. I'll never share it with anyone else.

${footer(ctx, "deserves_better")}`,
  },

  /**
   * Angle 3 — "I've helped similar businesses get online"
   * Social proof angle, friendliest tone. Works for trades and home services.
   */
  helped_neighbors: {
    key: "helped_neighbors",
    label: "Helped neighbors",
    description:
      "Social proof angle: position as 'I help businesses like yours in the area.'",
    subject: (ctx) =>
      `Helping ${ctx.lead.city} ${industryLabel(ctx.lead.industry)}s get a real website`,
    body: (ctx) => `Hi ${firstNameGuess(ctx.lead)},


Quick note from someone who's been helping ${ctx.lead.city} ${industryLabel(ctx.lead.industry)} businesses get a clean, simple website without the agency price tag.

I built a quick preview concept for ${ctx.lead.business_name} so you can see what a one-page site would look like for your services — colours, layout, the kind of thing customers actually find on Google.

Have a look:
${previewLink(ctx)}

A few honest things:
- It's a preview, not a live site. Forms are demo-locked.
- I never share previews publicly without your OK.
- If you don't like it, just reply "no thanks" and I won't follow up.

If you do like it, I can have a finished version up within a week, fully managed (hosting + edits) for a flat setup fee plus a small monthly.

Either way — appreciate the time.

${footer(ctx, "helped_neighbors")}`,
  },

  /**
   * Angle 4 — "I noticed your site could use a hand"
   * Observation-first, gentle, good for outdated/broken websites.
   */
  noticed_gap: {
    key: "noticed_gap",
    label: "Noticed a gap",
    description:
      "Observation angle: lead with the specific gap (no site / broken / outdated) you noticed.",
    subject: (ctx) => noticedSubject(ctx),
    body: (ctx) => noticedBody(ctx),
  },
};

// -----------------------------------------------------------------------------
// Angle helpers
// -----------------------------------------------------------------------------

/**
 * Deterministic angle pick — same lead always gets same angle,
 * so we can A/B test across leads cleanly later.
 */
export function pickAngle(seed: string): AngleKey {
  const keys: AngleKey[] = [
    "preview_made",
    "deserves_better",
    "helped_neighbors",
    "noticed_gap",
  ];
  const idx = stableHash(seed) % keys.length;
  return keys[idx];
}

/**
 * Round-robin angle rotation — useful for explicit split testing
 * where you want even distribution across a batch.
 */
export function rotateAngle(callIndex: number): AngleKey {
  const keys: AngleKey[] = [
    "preview_made",
    "deserves_better",
    "helped_neighbors",
    "noticed_gap",
  ];
  return keys[callIndex % keys.length];
}

// -----------------------------------------------------------------------------
// Contact-safety gate
// -----------------------------------------------------------------------------

export interface SafetyResult {
  ok: boolean;
  reasons: string[];
  failed: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a lead + prototype pair before any outreach is assembled.
 * Returns ok=true only if every required gate passes.
 *
 * Mirrors AGENT_PLAN.md §5 Contact-Safety Gate checklist.
 */
export function contactSafetyGate(
  lead: Lead,
  prototype?: Prototype | null
): SafetyResult {
  const failed: string[] = [];

  // 1. Public business email found
  if (!lead.email || !EMAIL_REGEX.test(lead.email)) {
    failed.push("no_valid_public_email");
  }

  // 2. Email source recorded
  if (!lead.email_source_url) {
    failed.push("no_email_source_url");
  }

  // 3. No do-not-contact warning (lead.status must not be flagged)
  if (
    lead.status === "do_not_contact" ||
    lead.status === "unsubscribed" ||
    lead.status === "lost"
  ) {
    failed.push(`lead_status_blocked:${lead.status}`);
  }

  // 4. Not in avoided industry
  const industryLower = String(lead.industry).toLowerCase();
  for (const bad of AVOIDED_INDUSTRIES) {
    if (industryLower.includes(bad)) {
      failed.push(`avoided_industry:${bad}`);
    }
  }

  // 5. Located in Canada (only market we ship to right now)
  if (lead.country && lead.country.toLowerCase() !== "canada") {
    failed.push(`not_canada:${lead.country}`);
  }

  // 6. Lead score threshold
  const score = lead.lead_score ?? 0;
  if (score < MIN_LEAD_SCORE_FOR_OUTREACH) {
    failed.push(`lead_score_too_low:${score}<${MIN_LEAD_SCORE_FOR_OUTREACH}`);
  }

  // 7. Prototype exists, is demo-locked, and watermarked
  if (!prototype) {
    failed.push("no_prototype");
  } else {
    if (!prototype.prototype_url) {
      failed.push("prototype_no_url");
    }
    if (prototype.watermark_enabled === false) {
      failed.push("prototype_not_watermarked");
    }
    if (prototype.demo_locked === false) {
      failed.push("prototype_not_demo_locked");
    }
  }

  const reasons: string[] = [];
  if (failed.length === 0) {
    reasons.push("all_gates_passed");
  } else {
    reasons.push(`failed:${failed.length}_gates`);
  }

  return {
    ok: failed.length === 0,
    reasons,
    failed,
  };
}

// -----------------------------------------------------------------------------
// Email body generator
// -----------------------------------------------------------------------------

export interface BuiltEmail {
  to: string;
  toName: string;
  subject: string;
  body: string;
  angle: AngleKey;
  leadId: string;
  prototypeId: string;
  safety: SafetyResult;
  generatedAt: string;
  includesScreenshot: boolean;
  includesPreviewLink: boolean;
  bodyPlainText: string; // stripped of markdown for safety
}

export interface BuildOptions {
  lead: Lead;
  prototype: Prototype;
  angle?: AngleKey;
  previewBaseUrl?: string;
  screenshotBaseUrl?: string;
  senderName?: string;
  senderEmail?: string;
  unsubscribeUrl?: string;
  bookingUrl?: string;
  includeScreenshot?: boolean;
}

const DEFAULTS = {
  previewBaseUrl: "https://webpreview-business.vercel.app",
  senderName: "Dexter from SiteSprint",
  senderEmail: "hello@sitesprint.example",
};

/**
 * Build a complete outreach email (subject + body + metadata).
 *
 * If the safety gate fails, the function still returns a BuiltEmail
 * (with safety.ok=false) so the caller can log the decision. It does
 * NOT auto-skip — the caller decides what to do.
 */
export function buildOutreach(opts: BuildOptions): BuiltEmail {
  const previewBaseUrl = opts.previewBaseUrl ?? DEFAULTS.previewBaseUrl;
  const screenshotBaseUrl = opts.screenshotBaseUrl ?? previewBaseUrl;
  const senderName = opts.senderName ?? DEFAULTS.senderName;
  const senderEmail = opts.senderEmail ?? DEFAULTS.senderEmail;
  const unsubscribeUrl =
    opts.unsubscribeUrl ??
    `${previewBaseUrl}/api/unsubscribe?lead=${encodeURIComponent(opts.lead.slug)}`;
  const includeScreenshot = opts.includeScreenshot ?? true;

  const ctx: EmailContext = {
    lead: opts.lead,
    prototype: opts.prototype,
    previewBaseUrl,
    screenshotBaseUrl,
    senderName,
    senderEmail,
    unsubscribeUrl,
    bookingUrl: opts.bookingUrl,
  };

  const angle = opts.angle ?? pickAngle(opts.lead.slug);
  const tpl = ANGLE_TEMPLATES[angle];

  const subject = tpl.subject(ctx);
  const body = tpl.body(ctx);

  const bodyPlainText = stripMarkdown(body);

  return {
    to: opts.lead.email ?? "",
    toName: opts.lead.business_name,
    subject,
    body,
    angle,
    leadId: opts.lead.id,
    prototypeId: opts.prototype.id,
    safety: contactSafetyGate(opts.lead, opts.prototype),
    generatedAt: new Date().toISOString(),
    includesScreenshot: includeScreenshot && !!opts.prototype.screenshot_url,
    includesPreviewLink: true,
    bodyPlainText,
  };
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

function firstNameGuess(lead: Lead): string {
  // Be conservative — fall back to "there" rather than guessing.
  // If we have a contact_name field later, use it.
  const fromName = (lead as unknown as { contact_name?: string }).contact_name;
  if (fromName && typeof fromName === "string") {
    return fromName.split(" ")[0];
  }
  return "there";
}

function industryLabel(industry: string): string {
  const map: Record<string, string> = {
    cleaning: "cleaning service",
    auto_repair: "auto repair shop",
    salon: "salon",
    barber: "barbershop",
    restaurant: "restaurant",
    contractor: "contractor",
    landscaper: "landscaper",
    tutor: "tutoring service",
    repair_shop: "repair shop",
    school: "school",
    store: "store",
    trades: "trades business",
    home_services: "home service",
    professional_services: "professional service",
  };
  const key = String(industry).toLowerCase();
  return map[key] ?? "small business";
}

function previewLink(ctx: EmailContext): string {
  return `${ctx.previewBaseUrl}/preview/${ctx.lead.slug}`;
}

function screenshotLine(ctx: EmailContext, include: boolean): string {
  if (!include || !ctx.prototype.screenshot_url) return "";
  const url = ctx.prototype.screenshot_url.startsWith("http")
    ? ctx.prototype.screenshot_url
    : `${ctx.screenshotBaseUrl ?? ctx.previewBaseUrl}${ctx.prototype.screenshot_url}`;
  return `Screenshot preview: ${url}`;
}

function footer(ctx: EmailContext, angle: AngleKey): string {
  const lines: string[] = [
    `— ${ctx.senderName}`,
    `${ctx.senderEmail}`,
    "",
    `You're getting this because ${ctx.lead.business_name} has a publicly listed business email and your site looked like a good fit for a one-page preview. Not interested? ${ctx.unsubscribeUrl}`,
    "",
    `(Outreach angle: ${angle}. This message is a one-off preview; we don't add anyone to a drip campaign.)`,
  ];

  if (ctx.bookingUrl) {
    lines.splice(2, 0, `Book a 10-min call: ${ctx.bookingUrl}`, "");
  }

  return lines.join("\n");
}

function noticedSubject(ctx: EmailContext): string {
  switch (ctx.lead.website_status) {
    case "none":
      return `No website for ${ctx.lead.business_name} (yet)?`;
    case "broken":
      return `${ctx.lead.business_name}'s website looks broken`;
    case "ugly":
    case "outdated":
      return `${ctx.lead.business_name}'s website could use a refresh`;
    default:
      return `Quick thought on ${ctx.lead.business_name}'s online presence`;
  }
}

function noticedBody(ctx: EmailContext): string {
  const gap =
    ctx.lead.website_status === "none"
      ? `I couldn't find a website for ${ctx.lead.business_name}`
      : ctx.lead.website_status === "broken"
      ? `${ctx.lead.business_name}'s website isn't loading properly`
      : `${ctx.lead.business_name}'s website feels a bit dated`;

  return `Hi ${firstNameGuess(ctx.lead)},


${gap} — which is honestly a shame, because the rest of the business looks solid (good reviews, clear services, real ${ctx.lead.city} reputation).

I sketched out a quick one-page concept to show what a modern, mobile-friendly version could look like. It's watermarked and demo-only, no real bookings or claims being made:

${previewLink(ctx)}

${screenshotLine(ctx, true)}

If the direction feels off, tell me what to change — I'm not precious about it. And if you'd rather I not follow up, just reply "no thanks" and that's the last you hear from me.

${footer(ctx, "noticed_gap")}`;
}

function stripMarkdown(s: string): string {
  // Trim leading/trailing whitespace per line, collapse 3+ blank lines.
  return s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stableHash(s: string): number {
  // Tiny FNV-1a — deterministic, no crypto needed.
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h);
}
