import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { RoleDTO } from '../../model/RoleDTO';
import { ConfirmModalComponent } from '../list-users/confirm-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ConfirmModalComponent],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.css'
})
export class RoleModalComponent implements OnInit {
  @Input() role: RoleDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() roleCreated = new EventEmitter<RoleDTO>();

  roleForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;
  roles: RoleDTO[] = [];
  isLoading: boolean = true;
  editMode: boolean = false;
  currentRoleId: number | null = null;

  showDeleteConfirmation: boolean = false;
  roleToDeleteId: number | null = null;
  deleteConfirmMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private http: HttpClient,
    private location: Location,
    private router: Router
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.http.get<RoleDTO[]>(`${environment.apiUrl}/auth-service/api/roles`).subscribe({
      next: (roles: RoleDTO[]) => {
        console.log('Roles loaded:', roles);
        this.roles = roles;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading roles', err);
        this.errorMessage = 'Unable to load roles. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.roleForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const roleName = this.roleForm.value.name;
    
    const formattedRoleName = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName.toUpperCase()}`;

    if (this.editMode && this.currentRoleId) {
      this.roleService.updateRole(this.currentRoleId, formattedRoleName).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'updated');
        },
        error: this.handleError.bind(this),
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.roleService.createRole(formattedRoleName).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'created');
        },
        error: this.handleError.bind(this),
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  handleSuccess(response: RoleDTO, action: string) {
    console.log(`Role ${action} successfully`, response);
    this.successMessage = `The role ${response.name} has been ${action} successfully.`;
    this.errorMessage = '';
    this.roleForm.reset();
    this.roleCreated.emit(response);
    this.editMode = false;
    this.currentRoleId = null;

    this.loadRoles();

    setTimeout(() => {
      this.closeModal();
    }, 2000);
  }

  handleError(error: any): void {
    console.error('Error during role operation', error);
    this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
    this.successMessage = '';
    this.isSubmitting = false;
  }

  editRole(role: RoleDTO) {
    this.editMode = true;
    this.currentRoleId = role.id;
    this.roleForm.patchValue({
      name: role.name
    });
  }

  deleteRole(id: number) {
    this.roleToDeleteId = id;
    const role = this.roles.find(r => r.id === id);
    this.deleteConfirmMessage = `Are you sure you want to delete the role <strong>"${role ? role.name : 'this role'}"</strong>?`;
    this.showDeleteConfirmation = true;
  }

  confirmRoleDeletion(): void {
    if (this.roleToDeleteId !== null) {
      this.roleService.deleteRole(this.roleToDeleteId).subscribe({
        next: () => {
          this.successMessage = 'The role has been deleted successfully.';
          this.loadRoles();
          this.showDeleteConfirmation = false;
          this.roleToDeleteId = null;
        },
        error: (err) => {
          this.handleError(err);
          this.showDeleteConfirmation = false;
          this.roleToDeleteId = null;
        }
      });
    }
  }

  cancelRoleDeletion(): void {
    this.showDeleteConfirmation = false;
    this.roleToDeleteId = null;
  }

  closeModal() {
    this.close.emit();
    this.router.navigate(['/admin']);
  }

  get f() {
    return this.roleForm.controls;
  }
}
