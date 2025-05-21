import { Component } from '@angular/core';

@Component({
  selector: 'app-user-layouts',
  imports: [],
  templateUrl: './user-layouts.component.html',
  styleUrl: './user-layouts.component.css'
})
export class UserLayoutsComponent {

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string | null;
        if (result) {
          // Sélectionner l'image par classe (ou mieux : utiliser ViewChild)
          const avatarElement = document.querySelector('.avatar') as HTMLImageElement;
          if (avatarElement) {
            avatarElement.src = result;
          }
        }
      };

      reader.readAsDataURL(input.files[0]);
    }
  }
}
