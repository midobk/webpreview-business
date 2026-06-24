/* Inline SVG icon set — zero deps, theme-aware (uses currentColor). */

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const IconLeads = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconPrototypes = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <path d="M3 8h18" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

export const IconShowcase = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconSettings = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconSearch = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconPlus = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconLogout = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconChevronRight = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconChevronDown = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconClose = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconExternal = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const IconCheck = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconBuilding = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);

export const IconSparkle = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3l1.9 5.7L19.5 10l-5.6 1.3L12 17l-1.9-5.7L4.5 10l5.6-1.3L12 3z" />
  </svg>
);

export const IconShield = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconBolt = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const IconLogo = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} viewBox="0 0 32 32" {...p}>
    <defs>
      <linearGradient id="admLogoGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#admLogoGrad)" />
    <path
      d="M11 22V10h6.5c2.2 0 3.8 1.4 3.8 3.4 0 1.5-.8 2.6-2.1 3.1 1.6.4 2.6 1.7 2.6 3.4 0 2.2-1.7 3.6-4.2 3.6H11zm2.4-7h3.4c1.2 0 1.9-.6 1.9-1.6 0-1-.7-1.6-1.9-1.6h-3.4v3.2zm0 5.1h3.6c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.7-2.2-1.7h-3.6v3.4z"
      fill="white"
    />
  </svg>
);