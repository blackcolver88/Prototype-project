import { Component, ViewChild, inject, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule} from '@angular/common';
import { Dialog, DialogModule} from '@angular/cdk/dialog';
import { TextformConfigComponent } from "../../configurations/textform-config/textform-config.component";
import { CheckboxConfigComponent } from "../../configurations/checkbox-config/checkbox-config.component";
import { SelectBoxConfigComponent } from "../../configurations/select-box-config/select-box-config.component";
import { RadioButtonConfigComponent } from "../../configurations/radio-button-config/radio-button-config.component";
import { EmailConfigComponent } from "../../configurations/email-config/email-config.component";
import { PhoneNumberConfigComponent } from "../../configurations/phone-number-config/phone-number-config.component";
import { DatepickerConfigComponent } from "../../configurations/datepicker-config/datepicker-config.component";
import { SectionComponent } from "../../components/section/section.component";
import { SectionConfigComponent } from "../../configurations/section-config/section-config.component";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { BasicdatepickerConfigComponent } from "../../configurations/basicdatepicker-config/basicdatepicker-config.component";
import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TextformComponent } from "../../components/textform/textform.component";
import { EmailComponent } from "../../components/email/email.component";
import { CheckboxComponent } from "../../components/checkbox/checkbox.component";
import { PhoneNumberComponent } from "../../components/phone-number/phone-number.component";
import { RadioButtonComponent } from "../../components/radio-button/radio-button.component";
import { SelectBoxComponent } from "../../components/select-box/select-box.component";
import { DatepickerComponent } from "../../components/datepicker/datepicker.component";
import { ButtonComponent } from "../../components/button/button.component";
import { ButtonConfigComponent } from '../../configurations/button-config/button-config.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog.component';
import { BasicDatepickerComponent } from '../../components/basic-datepicker/basic-datepicker.component';
import {PasswordComponent} from '../../components/password/password.component';
import {PasswordConfigComponent} from '../../configurations/password-config/password-config.component';
import { FormLayout } from '../../model/FormLayout';
import { FormTemplateService } from '../../services/form-template.service';
import { FormTemplate } from '../../model/FormTemplate';

export interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Layout',
    children: [{ name: 'SECTION' }],
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
      { name: 'Basic date picker' },
      { name: 'Date picker' },
      { name: 'Button' },
      { name: 'Password' },
    ],
  },
];

@Component({
  selector: 'app-editor-tree',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule, CdkTreeModule, DialogModule, CdkDropListGroup,
    SectionComponent, CdkStepperModule, HttpClientModule,FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent , BasicDatepickerComponent,PasswordComponent,PasswordConfigComponent],
  templateUrl: './editor-tree.component.html',
  styleUrls: ['./editor-tree.component.css']
})
export class EditorTreeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  templateId!: string;
  @ViewChild('acquiredItems') acquiredItems!: CdkDropList;
  @Output() saveStepper = new EventEmitter<any>();
  @Output() saveSection = new EventEmitter<any>();
  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource: any[] = TREE_DATA;
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
  editorItems: any[] = [];
  @Input() tabs: any[] = [];
  private dialog = inject(Dialog);


  formTemplateId: number | undefined;
  formLayoutsToAdd: FormLayout[] = []; 
  formTemplate!: FormTemplate; 

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef,private library: FaIconLibrary,
     private matDialog: MatDialog,private formTemplateService: FormTemplateService) {
    library.addIcons(faTrashAlt);
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadFormTemplateWithLayouts(this.templateId);
    });
  }
 


  ngOnDestroy() {
    this.destroy$.next(); // Détruit les souscriptions
    this.destroy$.complete();
  }

  loadEditorTree(id: string) {
    console.log('Loading editor tree for template ID:', id);
  }

  onEditorDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const draggedItem = event.item.data;
      if (!draggedItem) {
        console.error('Dragged item is null or undefined');
        return;
      }

      const targetIndex = event.currentIndex;

      switch (draggedItem.name) {
        case 'Text field':
          this.openDialog(TextformConfigComponent, draggedItem, targetIndex);
          break;
        case 'Email':
          this.openDialog(EmailConfigComponent, draggedItem, targetIndex);
          break;
        case 'Checkbox':
          this.openDialog(CheckboxConfigComponent, draggedItem, targetIndex);
          break;
        case 'Phone number':
          this.openDialog(PhoneNumberConfigComponent, draggedItem, targetIndex);
          break;
        case 'Radio button':
          this.openDialog(RadioButtonConfigComponent, draggedItem, targetIndex);
          break;
        case 'Select box':
          this.openDialog(SelectBoxConfigComponent, draggedItem, targetIndex);
          break;
        case 'Basic date picker':
          this.openDialog(BasicdatepickerConfigComponent, draggedItem, targetIndex);
          break;
        case 'Date picker':
          this.openDialog(DatepickerConfigComponent, draggedItem, targetIndex);
          break;
        case 'SECTION':
          this.openDialog(SectionConfigComponent, draggedItem, targetIndex);
          break;
        case 'Password':
          this.openDialog(PasswordConfigComponent, draggedItem, targetIndex);
          break;
        case 'Button':
          this.openDialog(ButtonConfigComponent, draggedItem, targetIndex);
          break;
        default:
          console.warn('Unhandled item type:', draggedItem.name);
      }
    }
  }

  private openDialog(
    configComponent: any,
    draggedItem: FoodNode,
    index: number,
    eventName?: string
  ) {
    const dialogRef = this.dialog.open(configComponent, {
      width: '70vw',
      height: '80vh',
      data: { item: draggedItem },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });

    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {

        this.editorItems.splice(index, 0, result);
        this.cdr.detectChanges();
      }
    });
  }
  handleButtonClick(type: string) {
    if (type === 'submit') {
      this.handleSubmit();
    } else if (type === 'reset') {
      this.resetForm();
    }
  }
  loadFormTemplateWithLayouts(id: string) {
    this.formTemplateService.getFormTemplateWithFormLayouts(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (formTemplate: FormTemplate) => {
          this.editorItems = formTemplate.formLayouts || [];
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error loading form template with layouts:', error);
        }
      );
  }

  handleSubmit() {
    this.formTemplateService.addFormLayoutsToFormTemplate(+this.templateId, this.editorItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (updatedFormTemplate: FormTemplate) => {
          console.log('Form layouts added successfully:', updatedFormTemplate);

          this.editorItems = updatedFormTemplate.formLayouts || [];
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error adding form layouts:', error);
        }
      );
  }


  resetForm() {
    this.editorItems = [];
    console.log('All items removed');
  }

  removeItem(item: any) {
    const index = this.editorItems.indexOf(item);
    if (index > -1) {
      this.editorItems.splice(index, 1);
    }
    console.log('Item removed:', item);
  }

  openDeleteDialog(): void {
    const dialogRef = this.matDialog.open(DeleteConfirmationDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.resetForm();
      }
    });
  }


  getOptionsArray(options: string | string[]): string[] {
    if (Array.isArray(options)) {
      return options;
    }
    if (typeof options === 'string') {
      return options.split(',').map(option => option.trim()).filter(option => option.length > 0);
    }
    return [];
  }

  onSectionItemDropped(event: any, section: any) {
    section.items = event.items;

    this.saveSection.emit(section);
  }


}
