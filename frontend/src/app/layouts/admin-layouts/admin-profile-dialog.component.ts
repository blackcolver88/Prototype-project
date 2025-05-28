import { Component } from '@angular/core';

import { AdminProfileComponent } from './admin-profile.component';
@Component({
  selector: 'app-admin-profile-dialog',
  standalone: true,
  imports: [AdminProfileComponent],
  template: `<app-admin-profile></app-admin-profile>`,
  styleUrls: ['./admin-profile-dialog.component.css']
})
export class AdminProfileDialogComponent { }
