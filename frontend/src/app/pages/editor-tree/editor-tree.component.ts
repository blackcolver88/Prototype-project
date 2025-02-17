import {Component, ViewChild, inject, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {Dialog, DialogModule, DialogRef} from '@angular/cdk/dialog';
import { TabConfigComponent } from '../../configurations/tab-config/tab-config.component';
import { StepperComponent } from '../../components/stepper/stepper.component';
import {TextformConfigComponent} from "../../configurations/textform-config/textform-config.component";
import {CheckboxConfigComponent} from "../../configurations/checkbox-config/checkbox-config.component";
import {SelectBoxConfigComponent} from "../../configurations/select-box-config/select-box-config.component";
import {RadioButtonConfigComponent} from "../../configurations/radio-button-config/radio-button-config.component";
import {EmailConfigComponent} from "../../configurations/email-config/email-config.component";
import {PhoneNumberConfigComponent} from "../../configurations/phone-number-config/phone-number-config.component";
import {DatepickerConfigComponent} from "../../configurations/datepicker-config/datepicker-config.component";
import {SectionComponent} from "../../components/section/section.component";
import {SectionConfigComponent} from "../../configurations/section-config/section-config.component";
import {CdkStepperModule} from "@angular/cdk/stepper";
import {BasicdatepickerConfigComponent} from "../../configurations/basicdatepicker-config/basicdatepicker-config.component";
import {HttpClientModule} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {PasswordConfigComponent} from '../../configurations/password-config/password-config.component';
export interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Layout',
    children: [{ name: 'Section' }],
  },
  {
    name: 'Form',
    children: [
      { name: 'Text field' },
      { name: 'Email' },
      { name: 'Checkbox' },
      { name: 'Phone number' },
      { name: 'Radio button' },
      { name: 'Select box' },
      { name: 'Ranged date picker' },
      { name: 'Date picker' },
      { name: 'Password'}
    ],
  },
];

@Component({
  selector: 'app-editor-tree',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule, CdkTreeModule, DialogModule, CdkDropListGroup, StepperComponent, SectionComponent, CdkStepperModule, HttpClientModule,],
  templateUrl: './editor-tree.component.html',
  styleUrls: ['./editor-tree.component.css']
})
export class EditorTreeComponent implements OnInit {
  templateId!: string;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadEditorTree(this.templateId);
    });
  }

  loadEditorTree(id: string) {

    console.log('Loading editor tree for template ID:', id);

  }
  @ViewChild('acquiredItems') acquiredItems!: CdkDropList;
  @Output() saveStepper = new EventEmitter<any>();
  @Output() saveSection = new EventEmitter<any>();
  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource: any[] = TREE_DATA;
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
  editorItems: any[] = [];
  @Input() tabs: any[] = [];
  private dialog = inject(Dialog);
  onEditorDrop(event: CdkDragDrop<FoodNode[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const draggedItem = event.item.data;
      if(draggedItem && draggedItem.name === 'Text field'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(TextformConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Checkbox'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(CheckboxConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Select box'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(SelectBoxConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Date picker'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(BasicdatepickerConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Radio button'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(RadioButtonConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Email'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(EmailConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Phone number'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(PhoneNumberConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Ranged date picker'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(DatepickerConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Password'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog2(PasswordConfigComponent,draggedItem);
      }
      else if(draggedItem && draggedItem.name === 'Section'){
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
        this.openDialog3(draggedItem,event.currentIndex);
      }
      else if (draggedItem) {
        copyArrayItem([draggedItem], event.container.data, 0, event.currentIndex);
      } else {
        console.error('Dragged item is null or undefined');
      }
    }
  }

  private openDialog2(configComponent: any,draggedItem: FoodNode) {
    const dialogRef: DialogRef<any> = this.dialog.open(configComponent, {
      width: '70vw',
      height: '80vh',
      data: {
        item: draggedItem
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
    dialogRef.closed.subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });

  }
  private openDialog3(draggedItem: FoodNode,index: number) {
    const dialogRef = this.dialog.open(SectionConfigComponent, {
      width: '70vw',
      height: '80vh',
      data: {
        item: draggedItem
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
    const componentInstance = dialogRef.componentInstance;
    if (componentInstance) {
      componentInstance.saveSection.subscribe((customizedSectionData: any) => {
        if (index !== undefined && index >= 0) {
          this.editorItems[index] = customizedSectionData;
        } else {
          console.error('No indexes senpaiiiii');
        }
      });
    }
    dialogRef.closed.subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }

}

