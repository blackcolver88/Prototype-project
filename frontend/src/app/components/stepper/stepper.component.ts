import {Component, ChangeDetectorRef, ElementRef, Input, OnInit} from '@angular/core';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import {CdkDropList, CdkDragDrop, copyArrayItem, moveItemInArray, CdkDrag} from '@angular/cdk/drag-drop';
import { Directionality } from '@angular/cdk/bidi';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CdkStepperModule, CdkDropList, CdkDrag,CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper implements OnInit {
  stepContents: any[] = [];
  @Input()  ss!: any;

  constructor(
    _dir: Directionality,
    _changeDetectorRef: ChangeDetectorRef,
    _elementRef: ElementRef
  ) {
    super(_dir, _changeDetectorRef, _elementRef);
  }

  ngOnInit() {
    if (this.steps ) {
      this.steps.forEach(() => this.stepContents.push([]));
    } else {
      console.error('Steps is not properly initialized');
    }
  }

  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }

  onDrop(event: CdkDragDrop<any[]>, stepIndex: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

}
