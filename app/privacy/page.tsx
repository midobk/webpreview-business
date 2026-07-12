import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Seaway Sites',
  description:
    'How Seaway Sites collects, uses, and protects your information under PIPEDA. Data hosted in Canada. We collect what we need and nothing more.',
};

/**
 * Privacy Policy page.
 *
 * Wires the footer link from app/page.tsx (the PIPEDA notice) to a
 * real route so the link no longer 404s. Content is honest, plain,
 * and aligned with the data Seaway Sites actually collects:
 *  - lead form: business name, email, optional website, optional message
 *  - hosting: Supabase (Canada), AgentMail for transactional replies
 *
 * The page itself is a server component — no motion, no client state,
 * no analytics — so it is trivially cheap to render and cache.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-paint hover:text-signal transition-colors mb-10"
        >
          ← Back to Seaway Sites
        </Link>

        <header className="mb-12">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
            <span className="w-1.5 h-1.5 rounded-full bg-paint" /> Privacy
          </p>
          <h1
            className="mt-5 text-4xl md:text-5xl tracking-tight"
            style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              fontVariationSettings: '"opsz" 96',
            }}
          >
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-steel">
            Plain-language summary of what we collect, why, and how to ask us
            to delete it. Seaway Sites complies with Canada&apos;s{' '}
            <em>Personal Information Protection and Electronic Documents Act</em>{' '}
            (PIPEDA).
          </p>
          <p className="mt-2 text-sm text-steel/70">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <Section title="What we collect">
          <p>
            When you request a preview, we collect the information you give us
            in the form:
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Your business name</li>
            <li>Your email address (used to send you the preview)</li>
            <li>An optional website URL (helps us tailor the preview)</li>
            <li>An optional message (anything else you want us to know)</li>
          </ul>
          <p>
            If you browse the site without submitting the form, we collect no
            personal information from you. We do not use third-party analytics
            or advertising trackers.
          </p>
        </Section>

        <Section title="How we use it">
          <p>
            We use the information you provide solely to generate and deliver
            your preview, and to follow up if you ask us to. We do not sell,
            rent, or trade your information with anyone.
          </p>
          <p>
            Aggregated, fully-anonymized counts (for example, &ldquo;we
            generated 169 previews this month&rdquo;) may appear in our
            internal dashboards, but they cannot be traced back to you.
          </p>
        </Section>

        <Section title="Where it is stored">
          <p>
            Lead data is stored in Supabase, hosted in{' '}
            <strong>Montréal, Canada</strong>. Transactional reply emails are
            sent through AgentMail. Both providers are bound by contract to
            keep your data inside Canada and to protect it under PIPEDA.
          </p>
          <p>
            We retain lead information for up to 12 months unless you ask us
            to delete it sooner.
          </p>
        </Section>

        <Section title="Your rights">
          <p>Under PIPEDA you can ask us at any time to:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Tell you what we hold about you</li>
            <li>Correct anything that is wrong</li>
            <li>Delete your information entirely</li>
            <li>Stop using your information for a specific purpose</li>
          </ul>
          <p>
            To exercise any of these rights, email{' '}
            <a
              href="mailto:hello@seawaysites.com"
              className="text-paint underline hover:text-signal"
            >
              hello@seawaysites.com
            </a>{' '}
            and we will respond within 30 days.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Seaway Sites does not set marketing or advertising cookies. The only
            cookie in use is a single first-party session cookie required by
            the admin login flow if you choose to sign in.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions, complaints, or access requests:{' '}
            <a
              href="mailto:hello@seawaysites.com"
              className="text-paint underline hover:text-signal"
            >
              hello@seawaysites.com
            </a>
            . If we cannot resolve a concern, you have the right to escalate
            to the Office of the Privacy Commissioner of Canada.
          </p>
        </Section>

        <div className="mt-16 pt-8 border-t border-paint/10 text-sm text-steel">
          <Link href="/" className="text-paint hover:text-signal">
            ← Back to the homepage
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2
        className="text-2xl text-ink mb-3"
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 36',
        }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-base text-steel leading-relaxed [&_ul]:mt-2 [&_p]:mt-2">
        {children}
      </div>
    </section>
  );
}
