import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute, Event } from '@angular/router';
import { UserProfile, UserService } from '../../services/user-profile.service';
import { AuthService } from '../../services/Auth.service';
import { TokenService } from '../../services/token.service';
import { CommonModule } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-layouts',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule, IonicModule, FormsModule],
  templateUrl: './user-layouts.component.html',
  styleUrl: './user-layouts.component.css'
})

export class UserLayoutsComponent implements OnInit, AfterViewInit {
  isAuthenticated = false;
  currentUser: UserProfile | null = null;
  pageTitle: string = 'Profile';
  userPhotoUrl: string | null = null;
  isDropdownOpen = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        console.log('Authentication status:', isAuth);
        this.isAuthenticated = isAuth;

        if (isAuth) {
          this.loadUserAndPhoto();
        }
      }
    );

    this.userService.currentUser$.subscribe(
      user => {
        console.log('Current user data:', user);
        this.currentUser = user;
        this.updatePhotoUrl();
        this.cdr.detectChanges();
      }
    );

    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((data) => {
      if (data['title']) {
        this.pageTitle = data['title'];
        document.title = `ST2I - ${data['title']}`;
      } else {
        this.updateTitleFromUrl();
      }
    });

    this.updateTitleFromUrl();
  }

  ngAfterViewInit() {
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  private updateTitleFromUrl(): void {
    const urlPath = this.router.url;

    if (urlPath.includes('/profile')) {
      this.pageTitle = 'Profile';
    } else if (urlPath.includes('/requests')) {
      this.pageTitle = 'Requests';
    } else if (urlPath.includes('/list')) {
      this.pageTitle = 'Responses';
    } else {
      this.pageTitle = 'Profile';
    }

    document.title = `USER - ${this.pageTitle}`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;

    if (!input || !input.files || input.files.length === 0) {
      console.error('Aucun fichier sélectionné');
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      console.error('Le fichier sélectionné n\'est pas une image.');
      return;
    }

    this.uploadPhoto(file);

    input.value = '';
  }

  private loadUserAndPhoto(): void {
    this.userService.loadCurrentUserWithPhoto();
  }
  
  private updatePhotoUrl(): void {
    console.log('Mise à jour de la photo URL, données utilisateur:', this.currentUser);
    
    if (!this.currentUser?.photo) {
      console.log('Aucune photo disponible pour l\'utilisateur');
      this.userPhotoUrl = this.getDefaultAvatarUrl();
      return;
    }

    const photoData = this.currentUser.photo;
    
    if (photoData.startsWith('http') || photoData.startsWith('data:image/')) {
      console.log('Utilisation de l\'URL de l\'image existante');
      this.userPhotoUrl = photoData;
      return;
    }
    
    try {
      const cleanBase64 = photoData.replace(/\s/g, '');
      
      if (this.isValidBase64(cleanBase64)) {
        if (cleanBase64.startsWith('data:image/')) {
          this.userPhotoUrl = cleanBase64;
        } else {
          this.userPhotoUrl = `data:image/png;base64,${cleanBase64}`;
        }
        console.log('URL de l\'image mise à jour avec succès');
      } else {
        console.error('Chaîne Base64 invalide');
        this.userPhotoUrl = this.getDefaultAvatarUrl();
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      this.userPhotoUrl = this.getDefaultAvatarUrl();
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
  
  uploadPhoto(file: File) {
    const userId = this.currentUser?.id;

    if (!userId) {
      console.error("Aucun utilisateur connecté ou ID non trouvé");
      return;
    }
    
    const loadingMessage = 'Téléchargement de la photo en cours...';
    console.log(loadingMessage);
    
    let body = new FormData();
    body.append('file', file);

    this.userService.ModifierPhoto(userId, body).subscribe({
      next: (response) => {
        console.log('Réponse du serveur après téléchargement:', response);
        
        if (response && response.photo) {
          if (!this.currentUser) this.currentUser = {} as UserProfile;
          this.currentUser.photo = response.photo;
          this.updatePhotoUrl();
          this.cdr.detectChanges();
        }
        
        // Recharger les données utilisateur pour s'assurer de la synchronisation
        setTimeout(() => {
          this.userService.loadCurrentUserWithPhoto();
        }, 500);
        
        console.log('Photo mise à jour avec succès');
        alert('Photo mise à jour avec succès !');
      },
      error: (err) => {
        console.error("Erreur lors de l'upload", err);
        let errorMessage = "Échec de la mise à jour de la photo.";
        
        if (err.status === 413) {
          errorMessage = "Le fichier est trop volumineux. Taille maximale autorisée : 5MB";
        } else if (err.error?.message) {
          errorMessage += `\n${err.error.message}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  getDefaultAvatarUrl(): string {
    return 'assets/default-avatar.png';
  }

  onImageError(event: ErrorEvent): void {
    console.error('Erreur de chargement de l\'image');
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.getDefaultAvatarUrl();
    }
  }

  canAccessForms(): boolean {
    return this.tokenService.isUser();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target) {
      const dropdown = target.closest('.dropdown');
      if (!dropdown && this.isDropdownOpen) {
        this.isDropdownOpen = false;
      }
    }
  }
}