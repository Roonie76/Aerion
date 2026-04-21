const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const OPT_OUT_KEY = 'aerion_analytics_opt_out';
let initialized = false;

function isBrowser() {
  return typeof window !== 'undefined';
}

function isEnabled() {
  return isBrowser() && Boolean(window.__AERION_GA_ENABLED__);
}

export function isAnalyticsOptedOut() {
  if (!isBrowser()) return false;

  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

function syncDisableFlag() {
  if (!GA_ID || !isBrowser()) return;
  window[`ga-disable-${GA_ID}`] = isAnalyticsOptedOut();
}

export function setAnalyticsOptOut(value = true) {
  if (!isBrowser()) return;

  try {
    if (value) {
      window.localStorage.setItem(OPT_OUT_KEY, '1');
    } else {
      window.localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch {
    return;
  }

  syncDisableFlag();
}

export function initAnalytics() {
  if (initialized || !GA_ID || !isEnabled()) return;

  syncDisableFlag();
  if (isAnalyticsOptedOut()) return;

  const existing = document.querySelector(`script[data-aerion-ga="${GA_ID}"]`);
  if (!existing) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.aerionGa = GA_ID;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  initialized = true;
}

export function trackPageView(path, title) {
  syncDisableFlag();
  if (!GA_ID || !isEnabled() || isAnalyticsOptedOut() || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

export function trackEvent(name, params = {}) {
  syncDisableFlag();
  if (!GA_ID || !isEnabled() || isAnalyticsOptedOut() || !window.gtag) return;

  window.gtag('event', name, params);
}

export function toGA4Item(product, quantity = 1) {
  return {
    item_id: product.id || product._id,
    item_name: product.name,
    item_category: product.series || undefined,
    price: Number(product.price) || 0,
    quantity,
  };
}
