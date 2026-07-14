export type ShowcasePrototypeLike = {
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
