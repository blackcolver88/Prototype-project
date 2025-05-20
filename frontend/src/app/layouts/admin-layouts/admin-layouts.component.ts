import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute, Event } from '@angular/router';
import { UserProfile, UserService } from '../../services/user-profile.service';
import { AuthService } from '../../services/Auth.service';
import { addIcons } from 'ionicons';
import { logoIonic } from 'ionicons/icons';
import { IonicModule } from '@ionic/angular';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layouts',
  standalone: true,
  imports: [RouterModule, RouterOutlet, IonicModule, CommonModule],
  templateUrl: './admin-layouts.component.html',
  styleUrl: './admin-layouts.component.css'
})
export class AdminLayoutsComponent implements OnInit, AfterViewInit {

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('profile') profile!: ElementRef;
  @ViewChild('sidebar') sidebar!: ElementRef;
  @ViewChild('mainContent') mainContent!: ElementRef;

  isAuthenticated = false;
  currentUser: UserProfile | null = null;
  pageTitle: string = 'Dashboard';
  sidebarCollapsed = false;
  dropdowns: { [key: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    addIcons({ logoIonic });
  }
  ngOnInit() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.sidebarCollapsed = savedState === 'true';

    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    this.userService.currentUser$.subscribe(
      user => this.currentUser = user
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

  private updateTitleFromUrl(): void {
    const urlPath = this.router.url;

    if (urlPath.includes('/dashboard') || urlPath === '/admin') {
      this.pageTitle = 'Dashboard';
    } else if (urlPath.includes('/form-template')) {
      this.pageTitle = 'Form Templates';
    } else if (urlPath.includes('/list_submissions')) {
      this.pageTitle = 'Submissions';
    } else if (urlPath.includes('/editor-tree')) {
      this.pageTitle = 'Form Editor';
    } else {
      this.pageTitle = 'Dashboard';
    }

    document.title = `ADMIN - ${this.pageTitle}`;
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

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.sidebarCollapsed));
  }
  
  ngAfterViewInit() {
    if (this.sidebarCollapsed && this.sidebar) {
      this.sidebar.nativeElement.classList.add('sidebar-collapsed');
    }
  }

  toggleDropdown(dropdownKey: string) {
    this.dropdowns[dropdownKey] = !this.dropdowns[dropdownKey];
  }

  isDropdownOpen(dropdownKey: string): boolean {
    return this.dropdowns[dropdownKey] ?? false;
  }

}
