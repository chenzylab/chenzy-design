/**
 * Global non-color scales — spacing, radius, typography, shadow, motion, z-index.
 * Atomic values only. Consume via Alias / Component tokens.
 */
export const spacing = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
} as const;

export const radius = {
  '1': '3px',
  '2': '6px',
  '3': '12px',
  full: '9999px',
} as const;

export const fontSize = {
  '1': '12px',
  '2': '14px',
  '3': '16px',
  '4': '20px',
  '5': '24px',
  '6': '32px',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
} as const;

export const lineHeight = {
  tight: '1.3',
  normal: '1.5',
  loose: '1.7',
} as const;

export const shadow = {
  '1': '0 1px 2px rgba(0,0,0,.08)',
  '2': '0 4px 12px rgba(0,0,0,.12)',
  '3': '0 8px 24px rgba(0,0,0,.16)',
} as const;

export const motion = {
  'duration-fast': '120ms',
  'duration-mid': '200ms',
  'duration-slow': '320ms',
  'ease-standard': 'cubic-bezier(.4,0,.2,1)',
} as const;

export const zIndex = {
  affix: '10',
  dropdown: '1050',
  modal: '1000',
  popover: '1030',
  toast: '1080',
  tooltip: '1070',
} as const;
