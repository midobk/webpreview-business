export type ShowcasePrototypeLike = {
  id?: unknown;
  generation_status?: unknown;
  showcase_approved?: unknown;
  showcase_eligible?: unknown;
  anonymized?: unknown;
  prototype_url?: unknown;
  screenshot_url?: unknown;
};

export function isShowcaseGenerationComplete(status: unknown): boolean {
  return typeof status === 'string' && status.toLowerCase() === 'completed';
}

export function isShowcaseVisible(prototype: ShowcasePrototypeLike): boolean {
  return prototype.showcase_approved === true &&
    isShowcaseGenerationComplete(prototype.generation_status) &&
    prototype.showcase_eligible === true &&
    prototype.anonymized === true;
}

export function isShowcaseVisibleForSlug(
  prototype: ShowcasePrototypeLike,
  slug: string,
): boolean {
  if (!isShowcaseVisible(prototype)) return false;
  if (prototype.id === slug) return true;
  if (typeof prototype.prototype_url !== 'string') return false;

  const match = prototype.prototype_url.match(
    /(?:data\/prototypes(?:-anonymized)?|\/preview)\/([^/?#]+)/i,
  );
  return match?.[1] ? decodeURIComponent(match[1]) === slug : false;
}
