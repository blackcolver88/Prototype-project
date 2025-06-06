import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Confirmation</h2>
        <button class="close-button" (click)="dialogRef.close()">×</button>
      </div>
      <mat-dialog-content [innerHTML]="data.message"></mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button class="cancel-btn" (click)="dialogRef.close()">Cancel</button>
        <button mat-button class="confirm-btn" (click)="dialogRef.close('confirm')">Confirm</button>
      </mat-dialog-actions>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule],
  styles: [`
    .dialog-container {
      padding: 16px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    h2[mat-dialog-title] {
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
      margin: 0;
      padding: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: #6b7280;
    }

    mat-dialog-content {
      font-size: 1rem;
      color: #6b7280;
      margin-bottom: 16px;
      padding: 0;
      line-height: 1.5;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin: 0;
    }

    mat-dialog-actions button {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background-color: #f3f4f6;
      color: #374151;
    }

    .cancel-btn:hover {
      background-color: #e5e7eb;
    }

    .confirm-btn {
      background-color: #dc2626;
      color: white;
    }

    .confirm-btn:hover {
      background-color: #b91c1c;
    }

    ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-color: white;
      --mdc-dialog-supporting-text-color: #6b7280;
    }

    ::ng-deep .mat-mdc-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
    }

    ::ng-deep .mat-mdc-dialog-actions {
      padding: 0 !important;
      margin: 0 !important;
    }

    ::ng-deep .mat-mdc-dialog-title {
      padding: 0 !important;
      margin: 0 !important;
    }
  `]
})
export class DeleteConfirmationDialog {
  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: { message: string }
  ) {}
}