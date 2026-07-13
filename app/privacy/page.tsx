import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Seaway Sites',
  description:
    'How Seaway Sites collects, uses and handles information submitted through the website.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-paint transition-colors hover:text-signal"
        >
          ← Back to Seaway Sites
        </Link>

        <header className="mb-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#E6F1ED] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-paint">
            <span className="h-1.5 w-1.5 rounded-full bg-paint" /> Privacy
          </p>
          <h1
            className="mt-5 text-4xl tracking-tight md:text-5xl"
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
            A plain-language summary of the information Seaway Sites receives through this
            website, why it is used and how to contact us about it.
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

        <Section title="Who operates this website">
          <p>
            Seaway Sites is operated by a Canadian business. We use privacy-conscious
            infrastructure and review the service providers involved in receiving website
            requests, preparing drafts and communicating with prospective clients.
          </p>
          <p>
            We do not claim that every service provider or every copy of submitted information
            is located exclusively in Canada. Storage and processing locations can depend on the
            provider and configuration in use at the time.
          </p>
        </Section>

        <Section title="What we collect">
          <p>When you request a website draft, we receive the information you submit:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>Your business name</li>
            <li>Your email address</li>
            <li>An optional current website URL</li>
            <li>An optional message about your business or desired direction</li>
          </ul>
          <p>
            We may also review business information that is already publicly available, such as
            a public business listing, service area, website, social profile or customer review,
            to personalize the requested draft.
          </p>
        </Section>

        <Section title="How we use it">
          <p>We use submitted and relevant public business information to:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>Evaluate and prepare the requested website draft</li>
            <li>Deliver the draft and respond to questions</li>
            <li>Provide paid website, hosting or support services when requested</li>
            <li>Maintain security, troubleshoot problems and improve the service</li>
          </ul>
          <p>
            We do not use submitted contact information for unrelated mass marketing. The draft
            request currently includes no sales call and no more than one routine follow-up unless
            you continue the conversation.
          </p>
        </Section>

        <Section title="Service providers and storage">
          <p>
            Seaway Sites relies on third-party providers for functions such as website hosting,
            database storage, form delivery, email and operational tooling. Those providers may
            process information under their own infrastructure, security and location terms.
          </p>
          <p>
            We aim to share only the information needed for each provider to perform its function
            and to use reasonable administrative and technical safeguards. No online service can
            guarantee absolute security.
          </p>
        </Section>

        <Section title="Retention">
          <p>
            We keep draft-request information only as long as reasonably needed to prepare and
            deliver the draft, manage the relationship, maintain business records and meet
            applicable legal or security requirements. Retention may differ when you become a
            paying client.
          </p>
        </Section>

        <Section title="Your choices">
          <p>
            You may ask us to provide, correct or delete information associated with your request,
            subject to any information we must retain for legal, security or operational reasons.
            Email{' '}
            <a href="mailto:hello@seawaysites.com" className="text-paint underline hover:text-signal">
              hello@seawaysites.com
            </a>{' '}
            with enough detail for us to identify the request.
          </p>
        </Section>

        <Section title="Cookies and site operation">
          <p>
            The website may use essential first-party cookies or similar browser storage for
            functions such as administration, security and interface preferences. Material changes
            to analytics or advertising practices will be reflected in this policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or privacy requests can be sent to{' '}
            <a href="mailto:hello@seawaysites.com" className="text-paint underline hover:text-signal">
              hello@seawaysites.com
            </a>
            .
          </p>
        </Section>

        <div className="mt-16 border-t border-paint/10 pt-8 text-sm text-steel">
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
        className="mb-3 text-2xl text-ink"
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          fontVariationSettings: '"opsz" 36',
        }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-steel [&_p]:mt-2 [&_ul]:mt-2">
        {children}
      </div>
    </section>
  );
}
