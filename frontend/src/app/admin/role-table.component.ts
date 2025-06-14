import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleModalComponent } from './role-modal/role-modal.component';
import { RoleDTO } from '../model/RoleDTO';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-role-table',
  standalone: true,
  imports: [CommonModule, RoleModalComponent],
  templateUrl: './role-table.component.html',
  styleUrls: ['./role-table.component.css']
})
export class RoleTableComponent implements OnInit {
  roles: RoleDTO[] = [];
  showModal = false;
  selectedRole: RoleDTO | null = null;
  isLoading = false;

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.refreshRoles();
  }

  refreshRoles() {
    this.isLoading = true;
    this.roleService.getAvailableRoles().subscribe({
      next: (roles: string[]) => {
        this.roles = roles.map(name => ({ name } as RoleDTO));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openAddRoleModal() {
    this.selectedRole = null;
    this.showModal = true;
  }

  openEditRoleModal(role: RoleDTO) {
    this.selectedRole = role;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.refreshRoles();
  }

  deleteRole(role: RoleDTO) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roleService.deleteRole(role.id).subscribe(() => this.refreshRoles());
    }
  }
}
