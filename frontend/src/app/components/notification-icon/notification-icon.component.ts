import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-icon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notification-container relative">
      <button (click)="toggleDropdown()" class="notification-button relative">
        <i class="fas fa-bell text-gray-600"></i>
        <span *ngIf="unreadCount > 0" class="notification-badge">
          {{ unreadCount }}
        </span>
      </button>

      <div *ngIf="isDropdownOpen" class="notification-dropdown">
        <div class="notification-header">
          <h3 class="text-lg font-semibold">Notifications</h3>
          <button *ngIf="hasUnread" (click)="markAllAsRead()" class="mark-all-read">
            Mark all as read
          </button>
        </div>

        <div class="notifications-list">
          <div *ngIf="notifications.length === 0" class="no-notifications">
            No notifications
          </div>

          <div *ngFor="let notification of notifications" 
               class="notification-item"
               [class.unread]="!notification.read"
               (click)="markAsRead(notification)">
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">
                {{ notification.createdAt | date:'shortTime' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
    }

    .notification-button {
      padding: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #ef4444;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      min-width: 18px;
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      z-index: 50;
      margin-top: 8px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .mark-all-read {
      font-size: 12px;
      color: #3b82f6;
      background: none;
      border: none;
      cursor: pointer;
    }

    .mark-all-read:hover {
      text-decoration: underline;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f3f4f6;
    }

    .notification-item.unread {
      background-color: #f0f9ff;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: 12px;
      color: #6b7280;
    }

    .no-notifications {
      padding: 24px;
      text-align: center;
      color: #6b7280;
    }
  `]
})
export class NotificationIconComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to notifications
    this.subscription.add(
      this.notificationService.notifications$.subscribe(
        notifications => this.notifications = notifications
      )
    );

    // Subscribe to unread count
    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(
        count => this.unreadCount = count
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  get hasUnread(): boolean {
    return this.notifications.some(n => !n.read);
  }

  markAsRead(notification: any) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }
}
