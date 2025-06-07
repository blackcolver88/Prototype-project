import { Component, OnInit } from '@angular/core';
import { RegisterRequest } from '../../model/RegisterRequest';
import { UserService, UserProfile } from '../../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { ConfirmModalComponent } from './confirm-modal.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
      
      const photoRequests = users.map(user => {
        return this.userService.getPhoto(user.id).pipe(
          map((photo: string | null) => {
            if (photo) {
              user.photo = this.processPhotoData(photo);
            }
            return user;
          })
        );
      });
      
      forkJoin(photoRequests).subscribe({
        next: (usersWithPhotos: UserProfile[]) => {
          this.allUsers = usersWithPhotos;
          this.updateTableData();
        },
        error: (err: Error) => {
          console.error('Erreur lors du chargement des photos:', err);
          this.updateTableData();
        }
      });
    });
  }
  
  private processPhotoData(photoData: string): string {
    if (!photoData) {
      return this.getDefaultAvatarUrl();
    }
    
    if (photoData.startsWith('http') || photoData.startsWith('data:image/')) {
      return photoData;
    }
    
    try {
      const cleanBase64 = photoData.replace(/\s/g, '');
      
      if (this.isValidBase64(cleanBase64)) {
        if (cleanBase64.startsWith('data:image/')) {
          return cleanBase64;
        } else {
          return `data:image/png;base64,${cleanBase64}`;
        }
      } else {
        console.error('Chaîne Base64 invalide');
        return this.getDefaultAvatarUrl();
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return this.getDefaultAvatarUrl();
    }
  }
  
  private isValidBase64(str: string): boolean {
    if (!str || str.trim() === '') {
      return false;
    }
    
    if (str.startsWith('data:image/')) {
      return true;
    }
    
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(str)) {
      return false;
    }
    
    if (str.length % 4 !== 0) {
      return false;
    }
    
    try {
      const decoded = atob(str);
      return decoded.length > 0;
    } catch (err) {
      return false;
    }
  }
  
  getDefaultAvatarUrl(): string {
    return 'assets/default-avatar.png';
  }
  
  onImageError(event: Event): void {
    console.error('Erreur de chargement de l\'image');
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.getDefaultAvatarUrl();
    }
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
      this.confirmMessage = `Are you sure you want to delete user <strong>${userToDelete.firstname} ${userToDelete.lastname}</strong>?`;
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
