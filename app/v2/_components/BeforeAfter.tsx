'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Draggable comparison: the average small-business site (last       */
/*  touched in 2013) vs. the SiteSprint preview. A full-surface       */
/*  range input drives the divider — native drag, click, keyboard     */
/*  and screen-reader support with zero pointer math.                 */
/* ------------------------------------------------------------------ */

export default function BeforeAfter() {
  const [pos, setPos] = useState(58);

  return (
    <div className="relative">
      <div className="v2-ba relative aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--v2-line-strong)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        {/* AFTER — fills the whole frame, revealed on the right */}
        <div className="absolute inset-0 bg-[#f7f5ef] text-[#181613] flex flex-col">
          <div className="flex items-center justify-between px-[5%] py-[2.4%] bg-[#12271c] text-[#f2efe7]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#3f9d6f]" />
              <span className="text-[11px] sm:text-sm font-semibold tracking-wide">
                Lakeside Landscaping
              </span>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-[#3f9d6f] px-3 py-1 text-[10px] font-semibold text-white">
              Get a quote
            </span>
          </div>
          <div className="px-[5%] pt-[4%]">
            <div className="v2-serif text-[clamp(1.1rem,3.4vw,2rem)] leading-tight font-semibold">
              Yards worth staying home for.
            </div>
            <p className="mt-1.5 text-[10px] sm:text-xs max-w-[70%] text-[#181613]/60 leading-snug">
              Design, build and seasonal care for Barrie &amp; Simcoe County. Free
              on-site estimates, every time.
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="inline-flex rounded-full bg-[#2c7a53] px-3 py-1.5 text-[10px] font-semibold text-white">
                Book an estimate
              </span>
              <span className="text-[9.5px] text-[#181613]/55">4.9 ★ · 112 Google reviews</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-[3%] px-[5%] pt-[4%] pb-[4%] items-start content-start">
            {[
              ['Design + build', 'Patios, beds, stone'],
              ['Seasonal care', 'Spring & fall cleanup'],
              ['Snow removal', 'Season contracts'],
            ].map(([t, l]) => (
              <div
                key={t}
                className="rounded-lg bg-white border border-[#181613]/10 p-2.5 flex flex-col gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-[#3f9d6f]" />
                <span className="text-[9.5px] sm:text-[11px] font-semibold leading-tight">{t}</span>
                <span className="text-[8.5px] sm:text-[9.5px] text-[#181613]/55 leading-tight">
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BEFORE — clipped to the left of the divider */}
        <div
          className="v2-before absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          aria-hidden="true"
        >
          <div className="flex h-full w-full flex-col justify-center px-[6%] py-[4%] text-center overflow-hidden">
            <div className="text-[clamp(0.9rem,2.6vw,1.5rem)] font-bold underline">
              Welcome To Lakeside Landscaping Web Site!!!
            </div>
            <div
              className="mx-auto my-[2%] h-[3px] w-3/4"
              style={{
                background:
                  'linear-gradient(90deg, red, orange, yellow, green, blue, purple)',
              }}
            />
            <p className="text-[10px] sm:text-xs leading-relaxed">
              We are a landscaping company. We do landscaping. Please call for
              landscaping. <a href="#proof" onClick={(e) => e.preventDefault()}>Click here</a> to
              enter site.
            </p>
            <div className="mt-[3%] inline-block border-2 border-dashed border-[#8a8a8a] bg-[#e9e6dd] px-4 py-2 text-[9px] sm:text-[10px]">
              🚧 UNDER CONSTRUCTION — new photos coming soon (2013) 🚧
            </div>
            <div className="mt-[3%]">
              <button type="button" tabIndex={-1} className="v2-before-btn">
                Guestbook
              </button>{' '}
              <button type="button" tabIndex={-1} className="v2-before-btn">
                Photos (broken)
              </button>
            </div>
            <div className="mt-[3%] font-mono text-[9px] sm:text-[10px] text-[#333]">
              Visitors: 004,521 · Best viewed in Internet Explorer 8
            </div>
          </div>
        </div>

        {/* Divider + handle (visual only — the input below drives it) */}
        <div
          className="v2-ba-divider absolute top-0 bottom-0 w-[2px] bg-[var(--v2-lume)] z-20"
          style={{ left: `${pos}%` }}
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--v2-lume)] text-[#0c0f08] shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
            </svg>
          </span>
        </div>

        <input
          type="range"
          min={2}
          max={98}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="v2-ba-range"
          aria-label="Drag to compare the old website with the SiteSprint preview"
        />
      </div>

      {/* Labels */}
      <div className="mt-4 flex items-center justify-between">
        <span className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">
          the site they have
        </span>
        <span className="v2-mono text-[10px] text-[var(--v2-lume)]">
          the preview we send — 90 seconds old
        </span>
      </div>
    </div>
  );
}
