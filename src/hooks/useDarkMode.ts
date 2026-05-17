import { useState, useEffect } from 'react';

const KEY = 'dinarr-theme';
const STYLE_ID = 'dinarr-dark-vars';

const DARK_VARS = `
:root {
  --bg: #0D1117;
  --surface: #161B22;
  --surface-2: #1C2430;
  --surface-3: #243040;
  --border: #2D3748;
  --border-strong: #3D4F64;
  --ink-1: #FFFFFF;
  --ink-2: #E0E8F0;
  --ink-3: #A8BCCF;
  --ink-4: #7A95AD;
  --brand: #58A6FF;
  --brand-2: #79B8FF;
  --brand-soft: #1A3050;
  --brand-tint: #0D1A28;
  --warn: #F0A030;
  --warn-soft: #2C1A00;
  --crit: #FF6B7A;
  --crit-soft: #2D0A10;
  --ok: #3DD68C;
  --ok-soft: #0A2418;
  --shadow-1: 0 1px 3px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4);
  --shadow-2: 0 4px 16px rgba(0,0,0,0.6), 0 12px 32px rgba(0,0,0,0.5);
}
`;

function applyTheme(dark: boolean) {
  // Toggle class for pill/button overrides
  document.documentElement.classList.toggle('dark', dark);

  // Inject/remove :root variable overrides (most reliable method)
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (dark) {
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = DARK_VARS;
  } else {
    el?.remove();
  }
}

// Run immediately before React mounts (no flash)
(function init() {
  const saved = localStorage.getItem(KEY);
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : sys);
})();

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyTheme(dark);
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
