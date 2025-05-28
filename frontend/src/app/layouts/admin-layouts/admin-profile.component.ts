import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-profile.service';
import { TokenService } from '../../services/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule], 
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  photoUrl: string = '';
  loading = false;
  userId: number | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      lastname: [''],
      firstname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  private originalUserData: any = null;

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    if (this.userId) {
      this.loading = true;
      this.userService.loadCurrentUserWithPhoto();
      
      this.userService.currentUser$.subscribe(profile => {
        if (profile) {
          this.originalUserData = { ...profile };
          
          this.profileForm.patchValue(profile);
          
          if (profile.photo) {
            this.updatePhotoUrl(profile.photo);
          }
        }
        this.loading = false;
      });
    }
  }
  
  resetForm(): void {
    if (this.originalUserData) {
      this.profileForm.patchValue({
        firstname: this.originalUserData.firstname,
        lastname: this.originalUserData.lastname,
        email: this.originalUserData.email,
        password: '',
        confirmPassword: ''
      });
      
      if (this.originalUserData.photo) {
        this.updatePhotoUrl(this.originalUserData.photo);
      }
      
      this.selectedFile = null;
      
      this.snackBar.open('Form reset to original values', 'Close', { 
        duration: 3000, 
        panelClass: ['bg-blue-500', 'text-white'] 
      });
    }
  }
  
  private updatePhotoUrl(photoData: string): void {
    if (!photoData) {
      this.photoUrl = 'assets/default-user.png';
      return;
    }
    
    if (photoData.startsWith('http') || photoData.startsWith('data:image/')) {
      this.photoUrl = photoData;
      return;
    }
    
    try {
      const cleanBase64 = photoData.replace(/\s/g, '');
      this.photoUrl = `data:image/png;base64,${cleanBase64}`;
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      this.photoUrl = 'assets/default-user.png';
    }
  }


  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('The selected file is not an image.', 'Close', { duration: 3000, panelClass: ['bg-red-500', 'text-white'] });
        return;
      }
      
      this.selectedFile = file;
      this.uploadPhoto(file); 
    }
  }
  
  uploadPhoto(file: File) {
    if (!this.userId) {
      this.snackBar.open('Unidentified user', 'Close', { duration: 3000, panelClass: ['bg-red-500', 'text-white'] });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file); 
    
    this.previewImage(file);
    
    this.loading = true;
    
    this.userService.ModifierPhoto(this.userId, formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('Photo edited successfully!', 'Close', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        
        if (response && response.photo) {
          this.updatePhotoUrl(response.photo);
        }
        
        this.userService.loadCurrentUserWithPhoto();
        this.selectedFile = null;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la modification de la photo:', error);
        
        let errorMessage = "Échec de la mise à jour de la photo.";
        if (error.status === 413) {
          errorMessage = "Le fichier est trop volumineux. Taille maximale autorisée : 5MB";
        } else if (error.error?.message) {
          errorMessage += `\n${error.error.message}`;
        }
        
        this.snackBar.open(errorMessage, 'Fermer', { duration: 3000, panelClass: ['bg-red-500', 'text-white'] });
      }
    });
  }
  
  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }



  saveProfile() {
    if (!this.userId) return;
    if (this.profileForm.invalid) return;
    
    this.loading = true;
    const formData = this.profileForm.value;
    
    const payload: any = {};
    ['email', 'firstname', 'lastname', 'password'].forEach(field => {
      if (formData[field]) payload[field] = formData[field];
    });
    
    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Profil modifié avec succès !', 'Fermer', { duration: 3000, panelClass: ['bg-green-600', 'text-white'] });
        this.ngOnInit();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la modification du profil:', error);
        this.snackBar.open('Erreur lors de la modification du profil.', 'Fermer', { duration: 3000, panelClass: ['bg-red-500', 'text-white'] });
      }
    });
  }


  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }
}