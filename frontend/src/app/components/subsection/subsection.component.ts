import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-subsection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subsection.component.html',
  styleUrls: ['./subsection.component.css']
})
export class SubsectionComponent {
  @Input() subsectionItems: any[] = [];
}