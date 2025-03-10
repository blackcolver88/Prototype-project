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
import { ActivatedRoute, Router } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import { catchError, forkJoin, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
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
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { TextAreaConfigComponent } from '../../configurations/text-area-config/text-area-config.component';
import { FormInput } from '../../model/FormInput';
import { MultipleValueService } from '../../services/multiple-value.service';
import { MultipleValue } from '../../model/MultipleValue';
import { FormInputService } from '../../services/form-input.service';

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
      { name: 'Text area' },
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
  imports: [CdkDropList, CdkDrag, CommonModule, CdkTreeModule, DialogModule, CdkDropListGroup,
   CdkStepperModule, HttpClientModule,FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent , BasicDatepickerComponent,TextAreaComponent,PasswordComponent],
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
    private router: Router,private matDialog: MatDialog,private formTemplateService: FormTemplateService,
     private formLayoutService: FormLayoutService,
    private formInputService: FormInputService, private multipleValueService: MultipleValueService) {
    library.addIcons(faTrashAlt);
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadFormTemplateWithLayouts(this.templateId);
            

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
      
      // Check if we need to update section order in the database
      const reorderedSections = this.editorItems.filter(item => item.id && item.type === 'Section');
      if (reorderedSections.length > 1) {
        this.updateSectionOrder(reorderedSections);
      }
      return;
    }
    
    const draggedItem = event.item.data;
    if (!draggedItem) return;
    
    if (event.container.id === this.acquiredItems.id) {
      if (draggedItem.name === 'Section') {
        this.createStandaloneSection(event.currentIndex);
      } else {
        const targetIndex = event.currentIndex;
        const nearestSectionIndex = this.findNearestSectionIndex(this.editorItems, targetIndex);
        
        if (nearestSectionIndex !== -1) {
          this.addItemToSection(draggedItem, this.editorItems[nearestSectionIndex]);
        } else {
          this.createSectionWithItem(draggedItem, targetIndex);
        }
      }
    } else {
      const targetSection = this.findSectionFromEvent(event);
      if (targetSection) {
        this.addItemToSection(draggedItem, targetSection);
      }
    }
  }
  
  private findNearestSectionIndex(items: any[], targetIndex: number): number {
    if (targetIndex < items.length && items[targetIndex]?.type === 'Section') {
      return targetIndex;
    }
    
    // Look for the closest section before the target index
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (items[i]?.type === 'Section') {
        return i;
      }
    }
    
    for (let i = targetIndex + 1; i < items.length; i++) {
      if (items[i]?.type === 'Section') {
        return i;
      }
    }
    
    return -1;
  }
  
  private findSectionFromEvent(event: CdkDragDrop<any[]>): any {
    const containerElement = event.container.element.nativeElement;
    const sectionElement = containerElement.closest('[data-section-id]');
    
    if (sectionElement) {
      const sectionId = sectionElement.getAttribute('data-section-id');
      return this.findSectionById(sectionId);
    }
    
    return null;
  }
  
  private findSectionById(sectionId: string | null): any {
    if (!sectionId) return null;
    
    const findInItems = (items: any[]): any => {
      for (const item of items) {
        if (item.type === 'Section' && item.id === sectionId) {
          return item;
        }
        if (item.items && item.items.length > 0) {
          const found = findInItems(item.items);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInItems(this.editorItems);
  }

  private createStandaloneSection(targetIndex: number): void {
    const dialogRef = this.dialog.open(SectionConfigComponent, {
      width: '70vw',
      height: '80vh',
      data: { 
        item: { name: 'Section' },
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
    if (index >= 0 && index < data.length) {
      const item = data[index];
      return item?.type === 'Section' ? item : null;
    }
    return null;
  }
  
  private addItemToSection(draggedItem: any, section: any): void {
    if (!section.items) {
      section.items = []; 
    }
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
    if (draggedItem.name === 'Section') return;
    const dialogRef = this.dialog.open(SectionConfigComponent, {
      width: '70vw',
      height: '80vh',
      data: { 
        item: { name: 'Section' },
        autoCreate: false // Flag to indicate this is an auto-created section
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
  
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(sectionResult => {
      if (sectionResult) {
        const section = {
          ...sectionResult,
          items: []
        };
  
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
      'Text area': TextAreaConfigComponent,
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

  private populateFormInputsIntoLayouts(formInputs: FormInput[]) {
    const inputsByLayoutId = formInputs.reduce((acc, input) => {
      const layoutId = input.formLayout.id;
      
      if (!acc[layoutId]) {
        acc[layoutId] = [];
      }
      acc[layoutId].push(input);
      return acc;
    }, {} as Record<number, FormInput[]>);
  
    this.editorItems = this.editorItems.map(layout => {
      if (layout.type === 'Section' && layout.id) {
        const layoutInputs = inputsByLayoutId[layout.id] || [];
        return {
          ...layout,
          items: layoutInputs.map(input => ({
            id: input.id, // Include the ID from the database
            type: input.type,
            config: {
              label: input.title,
              required: input.required
            }
          }))
        };
      }
      return layout;
    });
  }
   loadFormTemplateWithLayouts(id: string) {
    this.formTemplateService.getFormTemplateWithFormLayouts(+id)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(formTemplate => {
          this.editorItems = formTemplate.formLayouts || [];
          this.formTitle = formTemplate.title ?? '';
          
          return this.formTemplateService.getFormInputsByTemplateId(+id);
        }),
        catchError(error => {
          console.error('Error in loading process:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (formInputs: FormInput[]) => {
          this.populateFormInputsIntoLayouts(formInputs);
          this.loadFormInputsWithMultipleValues(formInputs);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading form template with layouts and inputs:', error);
        }
      });
  }
  handleSubmit() {
    console.log('Starting form submission process');
    
    // Add a unique temporary ID to each section that doesn't have an ID yet
    this.editorItems.forEach(item => {
      if (!item.id && item.type === 'Section') {
        item.tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
    });
    
    const layoutsToSave = this.editorItems.filter(item => !item.id && item.type === 'Section');
    
    console.log(`Found ${layoutsToSave.length} new sections to save`);
    
    if (layoutsToSave.length > 0) {
      console.log('Step 1: Saving new form layouts');
      this.formTemplateService.addFormLayoutsToFormTemplate(+this.templateId, layoutsToSave)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedFormTemplate: FormTemplate) => {
            console.log('Step 1 completed: Form layouts added successfully', updatedFormTemplate);
            
            // Create a map to maintain the relationship between temp IDs and saved layouts
            const tempIdToSavedLayoutMap = new Map<string, any>();
            
            if (updatedFormTemplate.formLayouts) {
              updatedFormTemplate.formLayouts.forEach(savedLayout => {
                const matchingItem = this.editorItems.find(item => 
                  (item.tempId && savedLayout.title === item.title) || 
                  (item.tempId && !item.id)
                );
                
                if (matchingItem) {
                  tempIdToSavedLayoutMap.set(matchingItem.tempId, savedLayout);
                }
              });
            }
            
            this.editorItems = this.editorItems.map(item => {
              if (item.tempId && tempIdToSavedLayoutMap.has(item.tempId)) {
                const savedLayout = tempIdToSavedLayoutMap.get(item.tempId);
                return {
                  ...savedLayout,
                  items: item.items || []
                };
              }
              return item;
            });
            
            console.log('Proceeding to Step 2: Saving form inputs');
            this.saveFormInputsToSections();
            this.router.navigate(['/form-template']);

          },
          error: (error) => {
            console.error('Step 1 failed: Error adding form layouts:', error);
          }
        });
    } else {
      console.log('No new layouts to save, proceeding directly to saving form inputs');
      this.saveFormInputsToSections();
      this.router.navigate(['/form-template']); 

    }
  }

saveFormInputsToSections() {
  console.log('Step 2: Starting to save form inputs to sections');
  
  if (!this.editorItems.length) {
    console.log('No editor items found, nothing to save');
    return;
  }

  console.log('Current editorItems structure:', JSON.stringify(this.editorItems, null, 2));

  const formInputRequests: any[] = [];
  const multiChoiceItems: {item: any, layoutId: number}[] = [];
  
  this.editorItems.forEach((section, index) => {
    console.log(`Processing section ${index}:`, section);
    
    if (section.type === 'Section') {
      const layoutId = section.id;
      console.log(`Section ID ${layoutId} found`);
      
      if (!section.items || !section.items.length) {
        console.log(`Section ${layoutId} has no items`);
        return;
      }
      
      console.log(`Section ${layoutId} has ${section.items.length} items`);
      
      section.items.forEach((item: any, itemIndex: number) => {
        console.log(`Processing item ${itemIndex} in section ${layoutId}:`, item);
        
        if (item.type === 'Section') {
          console.log('Skipping nested section');
          return;
        }
        
        if (!item.type) {
          console.log('Item missing type property, skipping');
          return;
        }
        
        if (item.id) {
          console.log(`Item ${itemIndex} already has ID ${item.id}, skipping`);
          return;
        }
        
        const itemConfig = item.config || {};
        const itemTitle = itemConfig.label || itemConfig.groupLabel || itemConfig.title || '';
        
        const formInputRequest = {
          formInput: {
            type: item.type,
            title: itemTitle, 
            config: JSON.stringify(itemConfig),
            required: itemConfig.isRequired || itemConfig.required || false
          },
          formLayoutId: layoutId
        };
        
        formInputRequests.push(formInputRequest);
        
        if (item.type === 'CHECKBOX' || item.type === 'SELECT_BOX' || item.type === 'RADIO_BUTTON') {
          multiChoiceItems.push({item, layoutId});
        }
        
        console.log(`Added form input request of type "${item.type}" to queue`);
      });
    } else {
      console.log(`Item at index ${index} is not a section:`, section);
    }
  });
  
  if (formInputRequests.length === 0) {
    console.log('No form inputs to save, process completed');
    return;
  }
  
  console.log(`Step 2: Saving ${formInputRequests.length} form inputs:`, formInputRequests);
  
  this.formTemplateService.addMultipleFormInputsToTemplate(+this.templateId, formInputRequests)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (savedInputs) => {
        console.log('Step 2 completed: Form inputs saved successfully', savedInputs);
        console.log(`Saved ${savedInputs.length} form inputs`);
        
        this.processMultiChoiceItems(multiChoiceItems, savedInputs);
        
        console.log('Final step: Reloading form template with layouts');
        this.loadFormTemplateWithLayouts(this.templateId);
      },
      error: (error) => {
        console.error('Step 2 failed: Error saving form inputs:', error);
      }
    });
}

  resetForm() {
    this.editorItems = [];
    console.log('All items removed');
  }

  removeItem(item: any) {
    // First try to find and remove the item from the top level (sections)
    const topLevelIndex = this.editorItems.indexOf(item);
    
    if (topLevelIndex !== -1) {
      // Item is a section
      if (item.id) {
        this.formLayoutService.deleteFormLayout(item.id).subscribe({
          next: () => {
            this.editorItems.splice(topLevelIndex, 1);
            console.log('Section deleted successfully:', item);
          },
          error: (err) => {
            console.error('Error deleting section:', err);
          }
        });
      } else {
        this.editorItems.splice(topLevelIndex, 1);
      }
      return;
    }

    // If item wasn't found at top level, search through sections for form inputs
    for (const section of this.editorItems) {
      if (section.type === 'Section' && section.items) {
        const sectionItemIndex = section.items.indexOf(item);
        if (sectionItemIndex !== -1) {
          // Item is a form input inside a section
          if (item.id) {
            // Delete form input from database
            this.formInputService.deleteFormInput(item.id).subscribe({
              next: () => {
                section.items.splice(sectionItemIndex, 1);
                console.log('Form input deleted successfully:', item);
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error deleting form input:', err);
              }
            });
          } else {
            // Remove form input locally if it has no ID
            section.items.splice(sectionItemIndex, 1);
            this.cdr.detectChanges();
          }
          return;
        }
      }
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

  getOptionsArray(options: string | string[] | any[]): string[] {
    if (Array.isArray(options)) {
      return options.map(opt => typeof opt === 'string' ? opt : JSON.stringify(opt));
    }
    if (typeof options === 'string') {
      return options.split(',').map(option => option.trim()).filter(option => option.length > 0);
    }
    return [];
  }

  onSectionItemDropped(event: CdkDragDrop<any[]>, section: any) {
    if (event.previousContainer === event.container) {
      // Move item within the same section
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Handle new item being dropped into section
      const draggedItem = event.item.data;
      if (!draggedItem) {
        console.error('Dragged item is null or undefined');
        return;
      }

      if (!section.items) {
        section.items = [];
      }

      // If it's a new item being dropped, open configuration dialog
      this.openDialog(this.getConfigComponent(draggedItem.name), draggedItem, 0)
        .pipe(takeUntil(this.destroy$))
        .subscribe(itemResult => {
          if (itemResult) {
            // Insert at the specific drop position
            section.items.splice(event.currentIndex, 0, itemResult);
            this.cdr.detectChanges();
          }
        });
    }
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

  private processMultiChoiceItems(multiChoiceItems: {item: any, layoutId: number}[], savedInputs: any[]) {
    console.log('Processing multi-choice items:', multiChoiceItems);
    
    multiChoiceItems.forEach(({item, layoutId}) => {
      const itemTitle = item.config.label || item.config.groupLabel || item.config.title || '';
      
      const savedInput = savedInputs.find(input => 
        input.type === item.type && 
        input.title === itemTitle
      );
      
      if (!savedInput) {
        console.error('No matching saved input found for multi-choice item:', item);
        console.error('Item title:', itemTitle);
        console.error('Available saved inputs:', savedInputs);
        return;
      }
      
      let options: any[] = [];
      
      if (item.type === 'CHECKBOX' || item.type === 'RADIO_BUTTON') {
        options = Array.isArray(item.config.options) 
          ? item.config.options.map((opt: any) => {
              if (typeof opt === 'string' && (opt.startsWith('{') || opt.includes('label'))) {
                try {
                  return JSON.parse(opt);
                } catch (e) {
                  return { 
                    label: opt,
                    value: opt
                  };
                }
              }
              else if (typeof opt === 'object') {
                return {
                  label: opt.label || '',
                  value: opt.value || opt.label || ''
                };
              }
              else {
                return {
                  label: opt,
                  value: opt
                };
              }
            }
          )
          : [];
      } else if (item.type === 'SELECT_BOX') {
        options = this.getOptionsArray(item.config.options);
      }
      
      if (options.length > 0) {
        const valuesForBackend = item.type === 'SELECT_BOX' 
          ? options 
          : options.map(opt => {
              if (typeof opt === 'string') {
                return opt;
              }
              return JSON.stringify(opt);
            });
        
        const multipleValue = {
          valeurs: valuesForBackend,
          formInput: {
            id: savedInput.id
          }
        };
        
        console.log(`Saving multiple values for ${item.type}:`, multipleValue);
        
        this.multipleValueService.createMultipleValue(multipleValue)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              console.log('Multiple values saved successfully:', result);
            },
            error: (error) => {
              console.error('Error saving multiple values:', error);
            }
          });
      }
    });
  }

private loadFormInputsWithMultipleValues(inputs: FormInput[]) {
  const multiChoiceInputs = inputs.filter(input => 
    input.type === 'CHECKBOX' || 
    input.type === 'SELECT_BOX' || 
    input.type === 'RADIO_BUTTON'
  );
  
  if (multiChoiceInputs.length === 0) {
    return;
  }
  
  // Create an array of observables for each multi-choice input
  const requests = multiChoiceInputs.map(input => 
    this.multipleValueService.getMultipleValuesByFormInputId(input.id).pipe(
      map(values => ({input, values})),
      catchError(error => {
        console.error(`Error loading multiple values for input ${input.id}:`, error);
        return of({input, values: []});
      })
    )
  );
  
  // Execute all requests in parallel
  forkJoin(requests)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        results.forEach(({input, values}) => {
          input.multipleValues = values as MultipleValue[];
          
          this.updateEditorItemWithMultipleValues(input);
        });
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading multiple values:', error);
      }
    });
}

private updateEditorItemWithMultipleValues(input: FormInput) {
  this.editorItems.forEach(section => {
    if (section.type === 'Section' && section.items) {
      section.items.forEach((item: any) => {
        if (item.id === input.id) {
          if (!item.config) {
            item.config = {};
          }
          
          const values = input.multipleValues && input.multipleValues[0] ? 
            input.multipleValues[0].valeurs : [];
          
          if (input.type === 'CHECKBOX' || input.type === 'RADIO_BUTTON') {
            item.config.options = values.map((val: string) => {
              try {
                if (typeof val === 'string' && val.startsWith('{')) {
                  return JSON.parse(val);
                }
                return val;
              } catch (e) {
                console.error('Error parsing value:', val, e);
                return val;
              }
            });
          } else if (input.type === 'SELECT_BOX') {
            item.config.options = values.join(',');
          }
        }
      });
    }
  });
}

collectFormValues(): any {
  const formValues: any = {};
  
  this.editorItems.forEach(section => {
    if (section.type === 'Section' && section.items) {
      section.items.forEach((item: any) => {
        if (!item.type) return;
        
        const inputId = item.id.toString();
        
        switch (item.type) {
          case 'CHECKBOX':
            formValues[inputId] = this.getSelectedCheckboxValues(item);
            break;
          case 'RADIO_BUTTON':
            formValues[inputId] = this.getSelectedRadioValue(item);
            break;
          case 'SELECT_BOX':
            formValues[inputId] = this.getSelectedSelectValue(item);
            break;
      
          }
      });
    }
  });
  
  return formValues;
}

private getSelectedCheckboxValues(item: any): any[] {
  if (!item.config || !item.config.options) {
    return [];
  }
  
  return item.config.options
    .filter((option: any) => {
      if (typeof option === 'string' && option.includes('checked')) {
        try {
          const parsed = JSON.parse(option);
          return parsed.checked === true;
        } catch (e) {
          return false;
        }
      }
      return typeof option === 'object' && option.checked === true;
    })
    .map((option: any) => {
      if (typeof option === 'string') {
        try {
          return JSON.parse(option).value;
        } catch (e) {
          return option;
        }
      }
      return option.value;
    });
}



private getSelectedRadioValue(id: number): string {
  return '';
}

private getSelectedSelectValue(id: number): string {
  return '';
}



  
  private updateSectionOrder(orderedSections: any[]): void {
    const sectionOrder = orderedSections.map((section, index) => ({
      id: section.id,
      ordinalPosition: index,
      title: section.title,
      type: section.type
    }));
    
    this.formTemplateService.updateFormLayoutsOrder(+this.templateId, sectionOrder)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Order updated successfully, no need to reload
        },
        error: (error) => {
          console.error('Error updating section order:', error);
        }
      });
  }
}