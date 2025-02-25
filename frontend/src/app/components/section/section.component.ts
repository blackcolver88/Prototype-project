import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, DragDropModule} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css'],
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    DragDropModule
  ],
  standalone: true
})
export class SectionComponent {
  @Input() sectionItems: any[] = [];
  @Input() connectedDropLists: string[] = [];
  @Output() itemDropped = new EventEmitter<any>();
  @Input()  section!: any;
  @Input() cdr!: ChangeDetectorRef;  

  onSectionDrop(event: any) {
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;

    if (previousContainer !== currentContainer) {
      const items = previousContainer.data.slice(event.previousIndex, event.previousIndex + event.item.data.length);
      currentContainer.data.push(...items);
      items.forEach((_item: any) => {
        previousContainer.data.splice(event.previousIndex, 1);
      });    }
    this.itemDropped.emit(event.item.data);
  }
  onSectionItemDropped(event: CdkDragDrop<any[]>, section: any) {
    const draggedItem = event.item.data;
    if (!draggedItem) {
      console.error('Dragged item is null or undefined');
      return;
    }

    section.items.push(draggedItem);
    this.cdr.detectChanges();
  }
}
