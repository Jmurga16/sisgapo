import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseUrl() { 
  return url;
}

const providers = [
  { provide: 'API_URL_INV', useFactory: getBaseUrl, deps: [] },
];


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  const url = environment.API_URL_INV;

