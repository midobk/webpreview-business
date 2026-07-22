import assert from 'node:assert/strict';
import test from 'node:test';

import { isShowcaseVisibleForSlug } from '../lib/showcase-policy.ts';

test('duplicate prototype rows cannot hide an approved showcase slug', () => {
  const slug = 'seaway-cleaning-services';
  const approved = {
    id: 'proto-approved',
    prototype_url: `data/prototypes/${slug}/index.html`,
    generation_status: 'completed',
    showcase_approved: true,
    showcase_eligible: true,
    anonymized: true,
  };
  const legacy = { ...approved, id: 'proto-legacy', showcase_approved: false };

  assert.equal([legacy, approved].some((row) => isShowcaseVisibleForSlug(row, slug)), true);
  assert.equal([approved, legacy].some((row) => isShowcaseVisibleForSlug(row, slug)), true);
  assert.equal(isShowcaseVisibleForSlug(legacy, slug), false);
});
