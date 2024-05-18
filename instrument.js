import * as Sentry from '@sentry/node';

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: 'https://65eb81765d3a2badf689190f63cc2e8c@o4507159862968320.ingest.de.sentry.io/4507159866179664',
  tracesSampleRate: 1.0,
});
