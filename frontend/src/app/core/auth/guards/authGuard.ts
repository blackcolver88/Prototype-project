import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../../services/Auth.service';
import { TokenService } from '../../../services/token.service';

export const authGuard = (next: any, state: any) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  if (tokenService.isTokenValid()) {
    return true;
  }

  
  // Redirect to login page with return url
  return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
};