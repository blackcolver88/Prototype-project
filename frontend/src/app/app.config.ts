import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter,withComponentInputBinding  } from '@angular/router';
import { tokenInterceptor } from './core/auth/interceptors/tokenInterceptor';
import { withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch} from '@angular/common/http'

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
              provideRouter(routes, withComponentInputBinding() ),
              provideClientHydration(withEventReplay()),
              provideHttpClient(withInterceptors([tokenInterceptor]))]
};
