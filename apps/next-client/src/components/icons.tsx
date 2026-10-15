import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
};

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const PhoneIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export const WalletIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
    <path d="M16 13.5h.01" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 12h14" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const SpinnerIcon = (props: IconProps) => (
  <svg {...base} {...props} className={`animate-spin motion-reduce:animate-none ${props.className ?? ''}`}>
    <path d="M21 12a9 9 0 1 1-6.2-8.56" />
  </svg>
);
