import {Component, HostListener, ElementRef, ViewChild, OnInit} from '@angular/core';
import { addIcons } from 'ionicons';
import { logoIonic } from 'ionicons/icons';
import { IonicModule } from "@ionic/angular";
import {Router, RouterModule} from "@angular/router";
import { AuthService } from '../../services/Auth.service';
import { UserService, UserProfile } from '../../services/user-profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    IonicModule,RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('profile') profile!: ElementRef;

  isAuthenticated = false;
  currentUser: UserProfile | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    addIcons({ logoIonic });
  }
  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    
    this.userService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  toggleMenu() {
    this.menu.nativeElement.classList.toggle('hidden');
  }
  
  toggleProfile() {
    this.profile.nativeElement.classList.toggle('hidden');
  }
  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}
