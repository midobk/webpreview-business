/**
 * Cal.com booking embed snippet.
 *
 * To be injected into every prototype HTML at the contact section.
 * The actual Cal.com link is per-deployment — for testing use a placeholder.
 *
 * Usage in a prototype:
 *   import { CAL_COM_SNIPPET } from '@/lib/cal-booking';
 *   html += CAL_COM_SNIPPET;
 *
 * Replace CAL_HANDLE with the user's real Cal.com handle when ready.
 */

// Cal.com handle/event are interpolated into https://cal.com/<handle>/<event>.
// Restrict to a path-segment-safe charset so a misconfigured env value (e.g.
// "../../evil.example") cannot turn the booking link into an open redirect to
// another host.
function calSegment(value: string, fallback: string): string {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/^-+|-+$/g, "");
  return sanitized || fallback;
}

export const CAL_COM_HANDLE = calSegment(process.env.CAL_COM_HANDLE || "", "seawaysites-demo");
export const CAL_COM_EVENT = calSegment(process.env.CAL_COM_EVENT || "", "5min");

export const CAL_COM_SNIPPET = `
<!-- Cal.com booking (demo-locked: link goes to "claim this website" instead) -->
<section class="book-call" style="padding: 60px 20px; text-align: center; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; margin: 40px auto; max-width: 600px;">
  <h3 style="font-size: 24px; margin-bottom: 12px; color: #0c4a6e;">Want to chat?</h3>
  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Book a 5-minute call to see the live version and talk through any tweaks you'd like.</p>
  <a href="https://cal.com/${CAL_COM_HANDLE}/${CAL_COM_EVENT}" target="_blank" rel="noopener"
     style="display: inline-block; background: #0284c7; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;"
     onclick="alert('Demo preview — claim this website to unlock the live booking link.'); return false;">
    Book a 5-min call →
  </a>
  <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Demo preview — booking link is locked until you claim the website.</p>
</section>
`;