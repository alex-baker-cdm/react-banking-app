import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { initSentry } from './app/sentry';

initSentry();

void bootstrapApplication(App, appConfig);
