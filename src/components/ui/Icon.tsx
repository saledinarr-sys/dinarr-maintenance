/* eslint-disable react-refresh/only-export-components */
import React from 'react';

interface IconProps {
  size?: number;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Base: React.FC<IconProps & { d?: string; sw?: number; fill?: string; children?: React.ReactNode }> = ({
  size = 20, stroke = 'currentColor', sw = 1.6, fill = 'none', d, children, className
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }} className={className}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const Logo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="28" height="28" rx="9" fill="#2B7CE9"/>
    <path d="M16 9v14M9 16h14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>
    <circle cx="22.5" cy="9.5" r="3.2" fill="#18A4A8" stroke="#fff" strokeWidth="1.4"/>
  </svg>
);

export const Plus: React.FC<IconProps> = (p) => <Base {...p}><path d="M12 5v14M5 12h14"/></Base>;
export const Bell: React.FC<IconProps> = (p) => <Base {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Base>;
export const Search: React.FC<IconProps> = (p) => <Base {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Base>;
export const Filter: React.FC<IconProps> = (p) => <Base {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Base>;
export const Camera: React.FC<IconProps> = (p) => <Base {...p}><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/></Base>;
export const MapPin: React.FC<IconProps> = (p) => <Base {...p}><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></Base>;
export const Clock: React.FC<IconProps> = (p) => <Base {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Base>;
export const Check: React.FC<IconProps> = (p) => <Base {...p} d="m5 12 5 5L20 7"/>;
export const CheckCircle: React.FC<IconProps> = (p) => <Base {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></Base>;
export const X: React.FC<IconProps> = (p) => <Base {...p}><path d="M6 6l12 12M18 6 6 18"/></Base>;
export const ChevronLeft: React.FC<IconProps> = (p) => <Base {...p} d="m15 18-6-6 6-6"/>;
export const ChevronRight: React.FC<IconProps> = (p) => <Base {...p} d="m9 18 6-6-6-6"/>;
export const ChevronDown: React.FC<IconProps> = (p) => <Base {...p} d="m6 9 6 6 6-6"/>;
export const Home: React.FC<IconProps> = (p) => <Base {...p} d="M4 11 12 4l8 7v9h-5v-6h-6v6H4z"/>;
export const List: React.FC<IconProps> = (p) => <Base {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></Base>;
export const User: React.FC<IconProps> = (p) => <Base {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></Base>;
export const Wrench: React.FC<IconProps> = (p) => <Base {...p} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z"/>;
export const Bolt: React.FC<IconProps> = (p) => <Base {...p} d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>;
export const Drop: React.FC<IconProps> = (p) => <Base {...p} d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>;
export const Snow: React.FC<IconProps> = (p) => <Base {...p}><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></Base>;
export const Stethoscope: React.FC<IconProps> = (p) => <Base {...p}><path d="M5 3v6a4 4 0 0 0 8 0V3M9 13v3a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/></Base>;
export const Monitor: React.FC<IconProps> = (p) => <Base {...p}><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></Base>;
export const Sofa: React.FC<IconProps> = (p) => <Base {...p} d="M4 11V8a3 3 0 0 1 6 0v3M14 11V8a3 3 0 0 1 6 0v3M3 12a2 2 0 0 1 4 0v5h10v-5a2 2 0 0 1 4 0v6H3z"/>;
export const Calendar: React.FC<IconProps> = (p) => <Base {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></Base>;
export const Image: React.FC<IconProps> = (p) => <Base {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 21"/></Base>;
export const Trend: React.FC<IconProps> = (p) => <Base {...p}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></Base>;
export const Star: React.FC<IconProps> = (p) => <Base {...p} d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>;
export const StarFill: React.FC<IconProps> = (p) => <Base {...p} sw={0} fill="currentColor" d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>;
export const Settings: React.FC<IconProps> = (p) => <Base {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Base>;
export const Phone: React.FC<IconProps> = (p) => <Base {...p} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.4 2L7.9 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.4c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2z"/>;
export const Send: React.FC<IconProps> = (p) => <Base {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></Base>;
export const Edit: React.FC<IconProps> = (p) => <Base {...p}><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4z"/></Base>;
export const Edit2: React.FC<IconProps> = (p) => <Base {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></Base>;
export const Trash2: React.FC<IconProps> = (p) => <Base {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Base>;
export const Paw: React.FC<IconProps> = (p) => <Base {...p}><circle cx="5" cy="9" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/><path d="M7 17a5 5 0 0 1 10 0c0 3-2 4-5 4s-5-1-5-4z"/></Base>;
export const ChartBar: React.FC<IconProps> = (p) => <Base {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Base>;
export const Inbox: React.FC<IconProps> = (p) => <Base {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.5z"/></Base>;
export const Logout: React.FC<IconProps> = (p) => <Base {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Base>;
export const Mic: React.FC<IconProps> = (p) => <Base {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></Base>;
export const Activity: React.FC<IconProps> = (p) => <Base {...p} d="M22 12h-4l-3 9-6-18-3 9H2"/>;
export const Building: React.FC<IconProps> = (p) => <Base {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></Base>;
export const MoreHorizontal: React.FC<IconProps> = (p) => <Base {...p}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Base>;

import type { CategoryId } from '../../types';

export const CATEGORY_ICONS: Record<CategoryId, React.FC<IconProps>> = {
  electric: Bolt,
  plumb: Drop,
  aircon: Snow,
  medical: Stethoscope,
  it: Monitor,
  furn: Sofa,
};
