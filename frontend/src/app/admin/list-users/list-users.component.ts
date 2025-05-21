import { Component, OnInit } from '@angular/core';
import { RegisterRequest } from '../../model/RegisterRequest';
import { UserService, UserProfile } from '../../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { ConfirmModalComponent } from './confirm-modal.component';

@Component({
  selector: 'app-list-users',
  imports: [CommonModule, FormsModule, UserModalComponent, ConfirmModalComponent],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css'
})
export class ListUsersComponent implements OnInit {
  allUsers: UserProfile[] = [];
  rowData: UserProfile[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];
  isBrowser = true;   
  showModal = false; 
  showConfirmModal = false; 
  userToDelete: number | null = null; 
  confirmMessage = ''; 

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

 
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.allUsers = users;
      this.updateTableData();
    });
  }


  updateTableData(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.rowData = this.allUsers.slice(start, end);
  }

 
  onPageSizeChange(): void {
    this.currentPage = 1; 
    this.updateTableData();
  }

 
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateTableData();
    }
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateTableData();
    }
  }


  goToPage(page: number): void {
    this.currentPage = page;
    this.updateTableData();
  }


  get totalPages(): number {
    return Math.ceil(this.allUsers.length / this.itemsPerPage);
  }


  getMaxItems(): number {
    const max = this.currentPage * this.itemsPerPage;
    return Math.min(max, this.allUsers.length);
  }


  openDialog(): void {
    console.log('Opening dialog for adding a new user');
    this.showModal = true;
  }



  handleDeleteClick(userId: number): void {
    this.userToDelete = userId;
    
    const userToDelete = this.allUsers.find(user => user.id === userId);
    if (userToDelete) {
      this.confirmMessage = `Are you sure you want to delete user ${userToDelete.firstname} ${userToDelete.lastname}?`;
    } else {
      this.confirmMessage = `Are you sure you want to delete this user?`;
    }
    
    this.showConfirmModal = true;
  }
  
  confirmDelete(): void {
    if (this.userToDelete !== null) {
      this.userService.deleteUser(this.userToDelete).subscribe({
        next: () => {
          console.log(`User with ID ${this.userToDelete} deleted successfully`);
          this.showConfirmModal = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.showConfirmModal = false;
        }
      });
    }
  }
  
  cancelDelete(): void {
    this.showConfirmModal = false;
    this.userToDelete = null;
  }
  closeModal(): void {
    this.showModal = false;
  }

  onUserCreated(user: RegisterRequest): void {
    console.log('User created:', user);
    this.loadUsers();
  }
}
