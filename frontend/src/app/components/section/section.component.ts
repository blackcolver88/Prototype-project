import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css'],
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule
  ],
  standalone: true
})
export class SectionComponent {
  @Input() sectionItems: any[] = [];
  @Input() connectedDropLists: string[] = [];
  @Output() itemDropped = new EventEmitter<any>();
  @Input()  section!: any;
  onSectionDrop(event: any) {
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;

    if (previousContainer !== currentContainer) {
      const item = previousContainer.data[event.previousIndex];
      currentContainer.data.push(item);
      previousContainer.data.splice(event.previousIndex, 1);
    }
    this.itemDropped.emit(event.item.data);
  }
}
