# IMAGE_ASSET_RULES.md (MVP — simplified)

## MVP Principle
Use AI-generated images as default. Safe, no copyright risk, no attribution needed.

## Image Sources

| Source | Use Case | Safe? |
|--------|----------|-------|
| image_generate (Google Gemini) | Hero images, section images, backgrounds | ✅ AI-generated, safe |
| image_generate (OpenAI) | Alternative AI images | ✅ AI-generated, safe |
| Customer-provided (after reply) | Real photos for final site | ✅ With approval |
| Google Places photos | Reference only for now | ⚠️ Attribution required, complex |
| Web images | Reference only, never use in prototype | ❌ Copyright risk |

## MVP Workflow
1. For each lead, generate 3-5 AI images via image_generate:
   - 1 hero image (industry-specific, branded)
   - 2-3 section images (services, gallery, about)
   - 1 background/texture if needed
2. Store images in `/public/prototypes/[slug]/images/`
3. Log source as "ai_generated" in image_assets
4. Use in prototype HTML

## Rules
- Never copy random web images into prototypes
- Never remove third-party watermarks
- Never use identifiable people's faces without permission
- Never fabricate before/after photos that misrepresent
- Label all prototypes as unofficial preview

## Full Tracking (later phase)
Complete image asset tracking system with license_status, attribution metadata, quality scoring, showcase suitability — implemented after MVP proves the concept.