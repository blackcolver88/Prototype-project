import { Component, ViewChild, inject, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule} from '@angular/common';
import { Dialog, DialogModule} from '@angular/cdk/dialog';
import { TextformConfigComponent } from "../../configurations/textform-config/textform-config.component";
import { CheckboxConfigComponent } from "../../configurations/checkbox-config/checkbox-config.component";
import { SelectBoxConfigComponent } from "../../configurations/select-box-config/select-box-config.component";
import { RadioButtonConfigComponent } from "../../configurations/radio-button-config/radio-button-config.component";
import { DatepickerConfigComponent } from "../../configurations/datepicker-config/datepicker-config.component";
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
import { FormLayout } from '../../model/FormLayout';
import { FormTemplateService } from '../../services/form-template.service';
import { FormTemplate } from '../../model/FormTemplate';
import { FormLayoutService } from '../../services/form-layout.service';

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
      { name: 'Checkbox' },
      { name: 'Radio button' },
      { name: 'Select box' },
      { name: 'Basic date picker' },
      { name: 'Date picker' },
      { name: 'Button' }
    ],
  },
];

@Component({
  selector: 'app-editor-tree',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule, CdkTreeModule, DialogModule, CdkDropListGroup,CdkStepperModule, HttpClientModule,FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent , BasicDatepickerComponent,PasswordComponent],
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

  formTitle: string = '';
  formTemplateId: number | undefined;
  formLayoutsToAdd: FormLayout[] = [];

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef,private library: FaIconLibrary,
    private matDialog: MatDialog,private formTemplateService: FormTemplateService,private formLayoutService: FormLayoutService) {
    library.addIcons(faTrashAlt);
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadFormTemplateWithLayouts(this.templateId);
            this.findDefaultFormLayout();
            

    });
  }



  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete();
  }

  loadEditorTree(id: string) {
    console.log('Loading editor tree for template ID:', id);
  }

  onEditorDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
  
    const draggedItem = event.item.data;
    if (!draggedItem) {
      console.error('Dragged item is null or undefined');
      return;
    }
  
    // Handle SECTION drag
    if (draggedItem.name === 'SECTION') {
      this.createStandaloneSection(event.currentIndex);
    } else {
      // Existing logic for form inputs
      const targetSection = this.findSectionAt(event.container.data, event.currentIndex);
      if (targetSection) {
        this.addItemToSection(draggedItem, targetSection);
      } else {
        this.createSectionWithItem(draggedItem, event.currentIndex);
      }
    }
  }

  private createStandaloneSection(targetIndex: number): void {
    const dialogRef = this.dialog.open(SectionConfigComponent, {
      width: '70vw',
      height: '80vh',
      data: { 
        item: { name: 'SECTION' },
        autoCreate: false
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
  
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(sectionResult => {
      if (sectionResult) {
        const section = {
          ...sectionResult,
          items: [] // Initialize items array for the section
        };
        this.editorItems.splice(targetIndex, 0, section);
        this.cdr.detectChanges();
      }
    });
  }

  private findSectionAt(data: any[], index: number): any {
    for (const item of data) {
      if (item.type === 'SECTION' && item.items) {
        return item;
      }
    }
    return null;
  }
  
  private addItemToSection(draggedItem: any, section: any): void {
    this.openDialog(this.getConfigComponent(draggedItem.name), draggedItem, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe(itemResult => {
        if (itemResult) {
          section.items.push(itemResult as never);
          this.cdr.detectChanges();
        }
      });
  }
  
  private createSectionWithItem(draggedItem: any, targetIndex: number): void {
    if (draggedItem.name === 'SECTION') return;
    const dialogRef = this.dialog.open(SectionConfigComponent, {
      width: '70vw',
      height: '80vh',
      data: { 
        item: { name: 'SECTION' },
        autoCreate: false // Flag to indicate this is an auto-created section
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
  
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(sectionResult => {
      if (sectionResult) {
        // Create the section with empty items array
        const section = {
          ...sectionResult,
          items: []
        };
  
        // Now handle the dragged item configuration
        this.openDialog(this.getConfigComponent(draggedItem.name), draggedItem, 0)
          .pipe(takeUntil(this.destroy$))
          .subscribe(itemResult => {
            if (itemResult) {
              section.items.push(itemResult as never);
              this.editorItems.splice(targetIndex, 0, section);
              this.cdr.detectChanges();
            }
          });
      }
    });
  }
  private getConfigComponent(itemName: string): any {
    const configMap: { [key: string]: any } = {
      'Text field': TextformConfigComponent,
      'Checkbox': CheckboxConfigComponent,
      'Radio button': RadioButtonConfigComponent,
      'Select box': SelectBoxConfigComponent,
      'Basic date picker': BasicdatepickerConfigComponent,
      'Date picker': DatepickerConfigComponent,
      'Button': ButtonConfigComponent,
      'Section': SectionConfigComponent
    };
    return configMap[itemName];
  }
  
  private handleItemDrop(draggedItem: any, targetIndex: number): void {
    const configComponent = this.getConfigComponent(draggedItem.name);
    if (configComponent) {
      this.openDialog(configComponent, draggedItem, targetIndex);
    }
  }

  private openDialog(configComponent: any, draggedItem: any, index: number) {
    const dialogRef = this.dialog.open(configComponent, {
      width: '70vw',
      height: '80vh',
      data: { item: draggedItem },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });

    return dialogRef.closed;
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
          this.formTitle = formTemplate.title ?? '';
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
    if (index === -1) return;

    if (item.id) {
      this.formLayoutService.deleteFormLayout(item.id).subscribe({
        next: () => {
          this.editorItems.splice(index, 1);
          console.log('Item deleted successfully:', item);
        },
        error: (err) => {
          console.error('Error deleting item:', err);
        }
      });
    } else {
      this.editorItems.splice(index, 1);
      console.log('Item removed locally:', item);
    }
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

  onSectionItemDropped(event: CdkDragDrop<any[]>, section: any) {
    const draggedItem = event.item.data;
    if (!draggedItem) {
      console.error('Dragged item is null or undefined');
      return;
    }

    section.items.push(draggedItem);
    this.saveSection.emit(section);
  }

  findDefaultFormLayout() {
    const defaultSection = this.editorItems.find(item => item.type === 'FormLayout');
    if (defaultSection) {
        console.log('Default FormLayout section found:', defaultSection);
    } else {
        console.log('No FormLayout section found');
    }
  }

  hasFormLayout(): boolean {
    return this.editorItems.some(item => item.type === 'FormLayout');
  }
  loadFormInputs(templateId: string) {
    this.formTemplateService.getFormInputsByTemplateId(+templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (formInputs) => {
          console.log('Form inputs loaded:', formInputs);
          this.editorItems = this.processFormInputs(formInputs);
          this.cdr.detectChanges(); 
        },
        (error) => {
          console.error('Error loading form inputs:', error);
        }
      );
  }

  processFormInputs(inputs: any[]): any[] {
    const sections = inputs.filter(input => input.type === 'SECTION');
    const standaloneInputs = inputs.filter(input => input.type !== 'SECTION' && !input.formLayout?.id);

    if (standaloneInputs.length > 0 && sections.length === 0) {
      sections.push({
        type: 'SECTION',
        config: { title: 'Section' },
        items: standaloneInputs
      });
    }

    sections.forEach(section => {
      section.items = inputs.filter(input => input.type !== 'SECTION' && input.formLayout?.id === section.id);
    });

    console.log('Processed editor items:', sections); 
    return sections;
  }
  
  

  

}
