import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment received — Seaway Sites',
  robots: { index: false, follow: false },
};

interface ThankYouPageProps {
  searchParams: Promise<{ plan?: string | string[] }>;
}

/**
 * Success-redirect target for the Stripe Payment Links used by the preview
 * purchase flow. Link the Managed plan to /thank-you?plan=managed and the
 * Own deposit to /thank-you?plan=own in the Stripe dashboard.
 */
export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const query = await searchParams;
  const rawPlan = Array.isArray(query.plan) ? query.plan[0] : query.plan;
  const plan = rawPlan === 'managed' || rawPlan === 'own' ? rawPlan : null;
  const contactEmail = process.env.CONTACT_EMAIL || 'hello@seawaysites.com';

  const steps =
    plan === 'own'
      ? [
          'Stripe emails your deposit receipt right away.',
          'We take your draft to production-ready and send you the finished site to review.',
          'Once you approve it, we send the balance invoice — then hand over the full source files, domain and hosting guidance, and start your 30 days of bug-fix support.',
        ]
      : [
          'Stripe emails your receipt right away.',
          'We finish your draft to production-ready and get it live on your domain — we will email you for the domain and business details we still need.',
          'Your monthly plan covers hosting, maintenance and two content updates a month. Update your card or cancel anytime from the billing link in your receipt.',
        ];

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-xl rounded-2xl p-8 shadow-xl" style={{ background: '#fff', color: '#111827' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#9E3B26' }}>
          Payment received
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">You&apos;re on the schedule.</h1>
        <p className="mt-3 text-sm leading-6" style={{ color: '#64748b' }}>
          Thanks for trusting us with your website. Here&apos;s exactly what happens next — no need to
          chase us, every step lands in your inbox.
        </p>

        <ol className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold"
                style={{ background: '#9E3B26', color: '#fff' }}
              >
                {index + 1}
              </span>
              <span style={{ color: '#475569' }}>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t pt-5 text-xs leading-5" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
          Questions at any point?{' '}
          <a href={`mailto:${contactEmail}`} className="underline" style={{ color: '#64748b' }}>
            {contactEmail}
          </a>{' '}
          — a real person answers.
        </p>
      </div>
    </main>
  );
}
