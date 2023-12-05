import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';
import * as SentryBrowser from '@sentry/browser';
import moment from 'moment-timezone';
import Vue from 'vue';

Sentry.init({
  Vue: Vue,
  dsn: process.env.VUE_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  environment: process.env.VUE_APP_ENV,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  tracingOptions: {
    trackComponents: true
  }
});
SentryBrowser.setTag('time_zone', moment.tz.guess());
