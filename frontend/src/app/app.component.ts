import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import {CdkStepperModule} from "@angular/cdk/stepper";
import {HttpClientModule} from "@angular/common/http";
import {NavbarComponent} from './components/navbar/navbar.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDialogModule, CdkStepperModule, HttpClientModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
