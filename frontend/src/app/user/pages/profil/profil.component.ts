import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile, UserService } from '../../../services/user-profile.service';
import { TokenService } from '../../../services/token.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {

  userProfileForm: FormGroup;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private dialog: MatDialog
  ) {
    this.userProfileForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('')
    }, { validators: this.passwordMatchValidator });
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

  ngOnInit(): void {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe(user => {
        if (user) {
          this.userProfileForm.patchValue({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
          });
        }
      });
    }

    this.userProfileForm.get('password')?.valueChanges.subscribe(() => {
      if (this.userProfileForm.get('confirmPassword')?.value) {
        this.userProfileForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    if (this.userProfileForm.invalid) {
      return;
    }
  
    const userId = this.tokenService.getUserId();
    if (!userId) {
      alert('Erreur : Utilisateur non identifié.');
      return;
    }
  
    const formData = this.userProfileForm.value;
  
    const updatedData: Partial<UserProfile> = {};
  
    if (formData.firstname) {
      updatedData.firstname = formData.firstname;
    }
    if (formData.lastname) {
      updatedData.lastname = formData.lastname;
    }
    if (formData.email) {
      updatedData.email = formData.email;
    }
    if (formData.password) {
      updatedData.password = formData.password;
    }
  
    this.userService.updateUser(userId, updatedData).subscribe(() => {
      this.openSuccessDialog('Profil mis à jour avec succès !');
      this.userService.loadCurrentUser(); 
    }, error => {
      console.error('Erreur lors de la mise à jour', error);
      alert('Impossible de mettre à jour le profil.');
    });
  }

  openSuccessDialog(message: string): void {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      width: '400px',
      data: { message },
      panelClass: 'success-dialog-container'
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog closed');
    });
  }
}


