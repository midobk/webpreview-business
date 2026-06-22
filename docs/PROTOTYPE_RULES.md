# PROTOTYPE_RULES.md

## Prototype = Sales Asset
Not a sample. Must make prospect feel seen and want to buy.

## Generation Pipeline
1. Gather business context (name, industry, services, location, description)
2. Select industry template (restaurant, salon, contractor, cleaning, auto, generic)
3. Generate hero image via image_generate (Google Gemini)
4. Generate additional section images as needed
5. Feed context + images + template to MiniMax M3
6. MiniMax M3 generates HTML/CSS one-page prototype
7. Add watermark + demo banner + locked CTAs
8. Save to `/preview/[slug]` route
9. Playwright screenshot (desktop + mobile)
10. Save metadata

## Industry Templates

### Restaurant
- Hero with food imagery
- Menu section (text from public info)
- Gallery grid
- Reservation CTA (locked)
- Reviews/testimonials
- Hours + map

### Salon/Barber
- Hero with salon imagery
- Services grid with prices (if public)
- Stylist/team section (generic)
- Booking CTA (locked)
- Gallery
- Hours + location

### Contractor/Trade
- Hero with work/project imagery
- Services list
- Project gallery (before/after style)
- Quote request CTA (locked)
- Service area map
- Testimonials

### Cleaning
- Hero with clean space imagery
- Service packages
- Before/after gallery
- Instant quote CTA (locked)
- Checkmarks/benefits
- Contact form (locked)

### Auto Repair
- Hero with garage imagery
- Services list
- Certifications (generic, not fabricated)
- Contact + map
- Appointment CTA (locked)

### Generic
- Clean hero with industry-relevant image
- Services overview
- About/why-us
- Contact CTA (locked)
- Map + hours

## Watermark + Demo Lock

Every prototype must include:
- Fixed top banner: "Demo Preview — Claim this website to make it live"
- Soft watermark in corner: "[Brand Name] Preview"
- All forms: disabled, show "Claim this website" message on submit attempt
- All CTAs: redirect to "Unlock the live version" modal
- No real phone/email links
- No functional booking/reservation

## Mobile Responsive
All prototypes must be mobile-first responsive. Test with Playwright mobile viewport.

## No False Claims
- Don't fabricate services the business doesn't offer
- Don't create fake reviews
- Don't imply the website is already live
- Don't use certifications/awards the business doesn't have
- Clearly label as unofficial preview concept