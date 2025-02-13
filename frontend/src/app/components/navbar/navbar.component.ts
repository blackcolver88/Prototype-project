import {Component, HostListener, ElementRef, ViewChild} from '@angular/core';
import { addIcons } from 'ionicons';
import { logoIonic } from 'ionicons/icons';
import { IonicModule } from "@ionic/angular";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    IonicModule,RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  @ViewChild("profile_default") profile?: ElementRef;
  @ViewChild("navbar_default") navbar?: ElementRef;


  constructor() {
    addIcons({ logoIonic });
  }

  onToggleProfile(): void {
    const elm = this.profile?.nativeElement;
    elm.classList.toggle('hidden')
  }

  onToggleMenu(): void {
    const elm=this.navbar?.nativeElement;
    elm.classList.toggle('hidden')
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;

    if (this.profile && !this.profile.nativeElement.contains(targetElement) &&
      !targetElement.closest('#user-menu-button')) {
      this.profile.nativeElement.classList.add('hidden');
    }

    if (this.navbar && !this.navbar.nativeElement.contains(targetElement) &&
      !targetElement.closest('[data-collapse-toggle="navbar_default"]')) {
      this.navbar.nativeElement.classList.add('hidden');
    }
  }
}
