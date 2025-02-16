import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content>Are you sure you want to delete all items?</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-button color="warn" (click)="dialogRef.close('confirm')">Delete</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule]
})
export class DeleteConfirmationDialog {
  constructor(public dialogRef: DialogRef<string>) {}
} 