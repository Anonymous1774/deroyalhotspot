/**
 * Subdomain-aware app mode detection
 * Maps window.hostname to the correct interface
 */
export type AppMode = 'public' | 'app' | 'platform' | 'account';

export function getAppMode(): AppMode {
  const host = window.location.hostname;

  // Production subdomains
  if (host.startsWith('app.'))      return 'app';
  if (host.startsWith('platform.')) return 'platform';
  if (host.startsWith('account.'))  return 'account';

  // Local development overrides via ?mode= query param
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode === 'app')      return 'app';
  if (mode === 'platform') return 'platform';
  if (mode === 'account')  return 'account';

  // Local dev hosts
  if (host === 'app.dhos.local')      return 'app';
  if (host === 'platform.dhos.local') return 'platform';
  if (host === 'account.dhos.local')  return 'account';

  return 'public';
}
