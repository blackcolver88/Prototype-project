export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;  // Changed from content to match backend
    type: string;     // Changed from notificationType to match backend
    read: boolean;
    createdAt: string;
    readAt?: string;
    relatedEntityId?: number;
    relatedEntityType?: string;
}

export interface NotificationCount {
    count: number;
}

export interface CreateNotificationRequest {
    userId: number;
    title: string;
    message: string;  // Changed from content to match backend
    type: string;     // Changed from notificationType to match backend
    targetRole?: string;
    resourceType: string;
}
