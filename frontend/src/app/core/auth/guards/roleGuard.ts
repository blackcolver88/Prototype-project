import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token.service';

export const adminGuard = (next: any, state: any) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isTokenValid()) {
    return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
  }

  if (tokenService.canAccessAdminRoutes()) {
    return true;
  }

  // Redirect to user profile if not admin/HR
  return router.parseUrl('/user/profile');
};

export const userGuard = (next: any, state: any) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isTokenValid()) {
    return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
  }

  if (tokenService.isUser()) {
    return true;
  }

  // Redirect to admin dashboard if not a regular user
  return router.parseUrl('/admin');
};

export const formAccessGuard = (next: any, state: any) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isTokenValid()) {
    return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
  }

  // Only ROLE_USER can access forms and form responses
  if (tokenService.isUser()) {
    return true;
  }

  // Redirect admin/HR users away from form submission pages
  return router.parseUrl('/admin');
};
