import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute, Event } from '@angular/router';
import { UserProfile, UserService } from '../../services/user-profile.service';
import { AuthService } from '../../services/Auth.service';
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
  @ViewChild('fileInput') fileInput!: ElementRef; 
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
  }
  
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        console.log('Authentication status:', isAuth);
        this.isAuthenticated = isAuth;
        
        if (isAuth) {
          this.userService.loadCurrentUser();
        }
      }
    );
    
    this.userService.currentUser$.subscribe(
      user => {
        console.log('Current user data:', user);
        this.currentUser = user;
        if (user?.photo) {
          this.userPhotoUrl = `data:image/png;base64,${user.photo}?t=${Date.now()}`;
        } else {
          this.userPhotoUrl = null;
        }
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
    } else if (urlPath.includes('/forms')) {
      this.pageTitle = 'Forms';
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
  uploadPhoto(file: File) {
    const userId = this.currentUser?.id;
  
    if (!userId) {
      console.error("Aucun utilisateur connecté ou ID non trouvé");
      return;
    }

    let body = new FormData();
    body.append('file', file);
  
    this.userService.ModifierPhoto(userId, body).subscribe({
      next: (response) => {
        console.log('Photo téléchargée avec succès', response);
        setTimeout(() => {
          this.userService.loadCurrentUser();
        }, 500); 
        alert('Photo mise à jour avec succès !');
      },
      error: (err) => {
        console.error("Erreur lors de l'upload", err);
        alert("Échec de la mise à jour de la photo.");
      }
    });
  }

  getDefaultAvatarUrl(): string {
    return 'assets/images/default-avatar.png'; 
  }
}