// Thin wrapper around gtag so components can fire events without caring
// whether Analytics has loaded (ad blockers, slow networks, SSR).
type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: EventParams) => void;
  }
}

export function track(event: string, params?: EventParams) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}
