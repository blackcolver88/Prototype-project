import { Component, Input } from '@angular/core';
import { CdkDrag} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css'],
  imports: [CdkDrag, CommonModule],
  standalone: true
})
export class SectionComponent {
  @Input() sectionItems: any[] = [];
}