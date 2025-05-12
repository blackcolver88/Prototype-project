import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';
import {provideHttpClient} from "@angular/common/http";
bootstrapApplication(AppComponent,appConfig)
  .catch((err) => console.error(err));
