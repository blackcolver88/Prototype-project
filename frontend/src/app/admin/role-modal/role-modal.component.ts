import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { RoleDTO } from '../../model/RoleDTO';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.css'
})
export class RoleModalComponent implements OnInit {
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
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.successMessage = 'The role has been deleted successfully.';
          this.loadRoles();
        },
        error: this.handleError.bind(this)
      });
    }
  }

  closeModal() {
    this.close.emit();
    this.router.navigate(['/admin']);
  }

  get f() {
    return this.roleForm.controls;
  }
}
