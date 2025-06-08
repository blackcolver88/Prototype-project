import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { Notification, NotificationCount, CreateNotificationRequest } from '../../model/Notification';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/auth-service/api/notifications`;
  
  // Subject to track unread notification count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Subject to track all notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  // Polling interval (30 seconds)
  private pollingInterval = 30000;
  private pollingSubscription: any;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Auto-start polling when service is initialized
    this.startPolling();
  }

  /**
   * Get HTTP headers with authorization
   */
  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get all notifications for the current user
   */
  getNotifications(): Observable<Notification[]> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return of([]);
    }

    const headers = this.getHeaders();
    return this.http.get<Notification[]>(`${this.API_URL}/user/${userId}`, { headers })
      .pipe(
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          const unreadCount = notifications.filter(n => !n.read).length;
          this.unreadCountSubject.next(unreadCount);
        }),
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of([]);
        })
      );
  }

  /**
   * Get unread notification count for the current user
   */
  getUnreadCount(): Observable<number> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return of(0);
    }

    const headers = this.getHeaders();
    return this.http.get<NotificationCount>(`${this.API_URL}/user/${userId}/unread-count`, { headers })
      .pipe(
        tap((response: any) => {
          const count = response.count || 0;
          this.unreadCountSubject.next(count);
        }),
        catchError(error => {
          console.error('Error fetching unread count:', error);
          return of(0);
        })
      );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<void> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return of();
    }

    const headers = this.getHeaders();
    return this.http.put<void>(`${this.API_URL}/${notificationId}/read`, {}, { headers })
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          this.notificationsSubject.next(updatedNotifications);
          
          // Update unread count
          const unreadCount = updatedNotifications.filter(n => !n.read).length;
          this.unreadCountSubject.next(unreadCount);
        }),
        catchError(error => {
          console.error('Error marking notification as read:', error);
          return of();
        })
      );
  }

  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead(): Observable<void> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      return of();
    }

    const headers = this.getHeaders();
    return this.http.put<void>(`${this.API_URL}/user/${userId}/mark-all-read`, {}, { headers })
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
          this.notificationsSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(error => {
          console.error('Error marking all notifications as read:', error);
          return of();
        })
      );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`, { headers })
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
          this.notificationsSubject.next(updatedNotifications);
          
          // Update unread count
          const unreadCount = updatedNotifications.filter(n => !n.read).length;
          this.unreadCountSubject.next(unreadCount);
        }),
        catchError(error => {
          console.error('Error deleting notification:', error);
          return of();
        })
      );
  }

  /**
   * Create a new notification
   */
  createNotification(request: CreateNotificationRequest): Observable<Notification> {
    const headers = this.getHeaders();
    return this.http.post<Notification>(`${this.API_URL}`, request, { headers })
      .pipe(
        tap(notification => {
          // Add to local state
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([notification, ...currentNotifications]);
          
          // Update unread count if notification is unread
          if (!notification.read) {
            const currentCount = this.unreadCountSubject.value;
            this.unreadCountSubject.next(currentCount + 1);
          }
        }),
        catchError(error => {
          console.error('Error creating notification:', error);
          throw error;
        })
      );
  }

  /**
   * Trigger form submission notification (calls backend to send emails and create notifications)
   */
  triggerFormSubmissionNotification(
    targetRole: string,
    formTitle: string,
    submitterName: string,
    submissionDate: string
  ): Observable<string> {
    const params = new HttpParams()
      .set('targetRole', targetRole)
      .set('formTitle', formTitle)
      .set('submitterName', submitterName)
      .set('submissionDate', submissionDate);

    return this.http.post(`${this.API_URL}/form-submission`, null, {
      params,
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Error triggering form submission notification:', error);
        throw error;
      })
    );
  }

  /**
   * Trigger task completion notification (calls backend to send emails and create notifications)
   */
  triggerTaskCompletionNotification(
    submitterUserId: number,
    formTitle: string,
    reviewerName: string,
    completionDate: string,
    status: string = 'Completed'
  ): Observable<string> {
    const params = new HttpParams()
      .set('submitterUserId', submitterUserId.toString())
      .set('formTitle', formTitle)
      .set('reviewerName', reviewerName)
      .set('completionDate', completionDate)
      .set('status', status);

    return this.http.post(`${this.API_URL}/task-completion`, null, {
      params,
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Error triggering task completion notification:', error);
        throw error;
      })
    );
  }

  /**
   * Start polling for notifications
   */
  private startPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    // Poll immediately, then at intervals
    this.refreshNotifications();
    
    this.pollingSubscription = timer(this.pollingInterval, this.pollingInterval)
      .subscribe(() => {
        // Only poll if user is authenticated
        if (this.tokenService.isTokenValid()) {
          this.refreshNotifications();
        }
      });
  }

  /**
   * Stop polling for notifications
   */
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Restart polling (useful after login)
   */
  restartPolling(): void {
    this.stopPolling();
    this.startPolling();
  }

  /**
   * Clear all notification data (useful for logout)
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.stopPolling();
  }

  /**
   * Refresh notifications from the server
   */
  private refreshNotifications(): void {
    this.getNotifications().subscribe();
  }
}
