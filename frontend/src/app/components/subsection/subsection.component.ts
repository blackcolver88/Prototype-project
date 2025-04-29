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
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detectChanges(); 
  }

  onSubsectionItemDropped(event: CdkDragDrop<any[]>, subsection: any) {
    if (event.previousContainer === event.container) {
      // Réorganiser les éléments dans la même zone
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.cdr.detectChanges(); 
  }
}