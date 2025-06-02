import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token.service';

export const adminGuard = (next: any, state: any) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isTokenValid()) {
    return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
  }

  // Allow any non-ROLE_USER role to access admin routes
  if (tokenService.canAccessAdminRoutes()) {
    return true;
  }

  // Redirect to user profile if user has ROLE_USER
  return router.parseUrl('/user/profile');
};

// Guard for admin-only features (Dashboard, Roles, Submissions management)
export const adminOnlyGuard = (next: any, state: any) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  if (!tokenService.isTokenValid()) {
    return router.parseUrl('/login?returnUrl=' + encodeURIComponent(router.url));
  }

  // Only users with ROLE_ADMIN can access these routes
  if (tokenService.canAccessAdminOnlyFeatures()) {
    return true;
  }

  // If trying to access the dashboard (root admin route), redirect to form-template
  if (router.url === '/admin' || router.url === '/admin/') {
    return router.parseUrl('/admin/form-template');
  }
  
  // Otherwise redirect to a default admin page if non-admin tries to access admin-only features
  return router.parseUrl('/admin/form-template');
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

  // Redirect non-ROLE_USER users away from form submission pages
  return router.parseUrl('/admin');
};
