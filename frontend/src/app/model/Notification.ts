export interface Notification {
    id: number;
    userId: number;
    title: string;
    content: string;
    notificationType: 'FORM_SUBMISSION' | 'TASK_COMPLETION';
    targetRole?: string;
    resourceType: 'FORM';
    read: boolean;
    createdAt: string;
}

export interface UnreadNotificationCount {
    count: number;
}

export interface CreateNotificationRequest {
    userId: number;
    title: string;
    content: string;
    notificationType: string;
    targetRole?: string;
    resourceType: string;
}
