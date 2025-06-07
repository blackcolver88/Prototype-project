import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirmation</h2>
          <button type="button" class="close-button" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-body">
          <p [innerHTML]="message"></p>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" (click)="onCancel()">Cancel</button>
          <button class="confirm-button" (click)="onConfirm()">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    
    .modal-body {
      margin-bottom: 20px;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .cancel-button, .confirm-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .cancel-button {
      background-color: #e2e8f0;
      color: #4a5568;
    }
    
    .confirm-button {
      background-color: #e53e3e;
      color: white;
    }
    
    .cancel-button:hover {
      background-color: #cbd5e0;
    }
    
    .confirm-button:hover {
      background-color: #c53030;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() message: string = 'Are you sure you want to proceed?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
