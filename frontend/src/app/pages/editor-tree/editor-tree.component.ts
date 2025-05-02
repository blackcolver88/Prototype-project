import { Component, ViewChild,inject,Output,EventEmitter,OnInit,Input,OnDestroy} from '@angular/core';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { TextformConfigComponent } from '../../configurations/textform-config/textform-config.component';
import { CheckboxConfigComponent } from '../../configurations/checkbox-config/checkbox-config.component';
import { SelectBoxConfigComponent } from '../../configurations/select-box-config/select-box-config.component';
import { RadioButtonConfigComponent } from '../../configurations/radio-button-config/radio-button-config.component';
import { DatepickerConfigComponent } from '../../configurations/datepicker-config/datepicker-config.component';
import { SectionConfigComponent } from '../../configurations/section-config/section-config.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { BasicdatepickerConfigComponent } from '../../configurations/basicdatepicker-config/basicdatepicker-config.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, Subject,switchMap, takeUntil, throwError,} from 'rxjs';
import { FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TextformComponent } from '../../components/textform/textform.component';
import { EmailComponent } from '../../components/email/email.component';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { PhoneNumberComponent } from '../../components/phone-number/phone-number.component';
import { RadioButtonComponent } from '../../components/radio-button/radio-button.component';
import { SelectBoxComponent } from '../../components/select-box/select-box.component';
import { DatepickerComponent } from '../../components/datepicker/datepicker.component';
import { ButtonComponent } from '../../components/button/button.component';
import { ButtonConfigComponent } from '../../configurations/button-config/button-config.component';
import { MatDialog } from '@angular/material/dialog';
import { BasicDatepickerComponent } from '../../components/basic-datepicker/basic-datepicker.component';
import { PasswordComponent } from '../../components/password/password.component';
import { FormTemplateService } from '../../services/form-template.service';
import { FormTemplate } from '../../model/FormTemplate';
import { FormLayoutService } from '../../services/form-layout.service';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { TextAreaConfigComponent } from '../../configurations/text-area-config/text-area-config.component';
import { FormInput } from '../../model/FormInput';
import { MultipleValueService } from '../../services/multiple-value.service';
import { MultipleValue } from '../../model/MultipleValue';
import { FormInputService } from '../../services/form-input.service';
import { SubsectionConfigComponent } from '../../configurations/subsection-config/subsection-config.component';

export interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Layout',
    children: [{ name: 'Section' },
      { name: 'Subsection' },
    ],
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
      { name: 'Button' },
    ],
  },
];

@Component({
  selector: 'app-editor-tree',
  standalone: true,
  imports: [CdkDropList,CdkDrag,CommonModule,CdkTreeModule,DialogModule,CdkDropListGroup,CdkStepperModule,HttpClientModule,FontAwesomeModule,TextformComponent,
    EmailComponent,CheckboxComponent,PhoneNumberComponent,RadioButtonComponent,SelectBoxComponent,DatepickerComponent,ButtonComponent,BasicDatepickerComponent,
    TextAreaComponent,PasswordComponent
  ],
  templateUrl: './editor-tree.component.html',
  styleUrls: ['./editor-tree.component.css'],
})
export class EditorTreeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  templateId!: string;
  @ViewChild('acquiredItems') acquiredItems!: CdkDropList;
  @Output() saveStepper = new EventEmitter<any>();
  @Output() saveSection = new EventEmitter<any>();
  treeControl = new NestedTreeControl<FoodNode>((node) => node.children);
  dataSource: any[] = TREE_DATA;
  hasChild = (_: number, node: FoodNode) =>
    !!node.children && node.children.length > 0;
  editorItems: any[] = [];
  @Input() tabs: any[] = [];
  private dialog = inject(Dialog);

  formTitle: string = '';
  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private library: FaIconLibrary,
    private router: Router,
    private matDialog: MatDialog,
    private formTemplateService: FormTemplateService,
    private formLayoutService: FormLayoutService,
    private formInputService: FormInputService,
    private multipleValueService: MultipleValueService
  ) {
    library.addIcons(faTrashAlt, faPlus);
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
  
      // Check if we need to update section order in the database
      const reorderedSections = this.editorItems.filter(
        (item) => item.id && item.type === 'Section'
      );
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
        const nearestSectionIndex = this.findNearestSectionIndex(
          this.editorItems,
          targetIndex
        );
  
        if (nearestSectionIndex !== -1) {
          const targetSection = this.editorItems[nearestSectionIndex];
          
          if (targetSection.children && targetSection.children.length > 0) {
            this.addItemToSubsection(draggedItem, targetSection.children[0]);
          } else {
            this.addItemToSection(draggedItem, targetSection);
          }
        } else {
          this.createSectionWithItem(draggedItem, targetIndex);
        }
      }
    } else {
      const targetSection = this.findSectionFromEvent(event);
      if (targetSection) {
        if (targetSection.children && targetSection.children.length > 0) {
          this.addItemToSubsection(draggedItem, targetSection.children[0]);
        } else {
          this.addItemToSection(draggedItem, targetSection);
        }
      }
    }
  }

  private addItemToSubsection(draggedItem: any, subsection: any): void {
    if (!subsection.items) {
      subsection.items = [];
    }
    
    this.openDialog(this.getConfigComponent(draggedItem.name), draggedItem, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe((itemResult) => {
        if (itemResult) {
          subsection.items.push(itemResult);
          this.cdr.detectChanges();
        }
      });
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
    const subsectionElement = containerElement.closest('[data-subsection-id]');
    if (subsectionElement) {
        const subsectionId = subsectionElement.getAttribute('data-subsection-id');
        return this.findSubsectionById(subsectionId);
    }
    const sectionElement = containerElement.closest('[data-section-id]');
    if (sectionElement) {
        const sectionId = sectionElement.getAttribute('data-section-id');
        return this.findSectionById(sectionId);
    }
    return null;
}

private findSubsectionById(subsectionId: string | null): any {
    if (!subsectionId) return null;
    const findInItems = (items: any[]): any => {
        for (const item of items) {
            if (item.type === 'Subsection' && item.id === subsectionId) {
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
      height: '50vh',
      data: {
        item: { name: 'Section' },
        autoCreate: false,
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });

    dialogRef.closed
      .pipe(takeUntil(this.destroy$))
      .subscribe((sectionResult) => {
        if (sectionResult) {
          const section = {
            ...sectionResult,
            items: [], // Initialize items array for the section
          };
          this.editorItems.splice(targetIndex, 0, section);
          this.cdr.detectChanges();
        }
      });
  }


  private addItemToSection(draggedItem: any, section: any): void {
    if (!section.items) {
      section.items = [];
    }
    
    if (draggedItem.name === 'Subsection') {
      this.addSubsection(section);
      return;
    }
    
    this.openDialog(this.getConfigComponent(draggedItem.name), draggedItem, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe((itemResult) => {
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
        autoCreate: false,
      },
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });
  
    dialogRef.closed
      .pipe(takeUntil(this.destroy$))
      .subscribe((sectionResult) => {
        if (sectionResult) {
          const section = {
            ...sectionResult,
            items: [],
            children: [] 
          };
  
          this.openDialog(
            this.getConfigComponent(draggedItem.name),
            draggedItem,
            0
          )
            .pipe(takeUntil(this.destroy$))
            .subscribe((itemResult) => {
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
      Checkbox: CheckboxConfigComponent,
      'Radio button': RadioButtonConfigComponent,
      'Select box': SelectBoxConfigComponent,
      'Basic date picker': BasicdatepickerConfigComponent,
      'Date picker': DatepickerConfigComponent,
      Button: ButtonConfigComponent,
      Section: SectionConfigComponent,
      Subsection: SubsectionConfigComponent,
    };
    return configMap[itemName];
  }
  private openDialog(configComponent: any, draggedItem: any, index: number) {
    const dialogRef = this.dialog.open(configComponent, {
      width: '70vw',
      height: '55vh',
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

  // private populateFormInputsIntoLayouts(formInputs: FormInput[]) {
  //   const inputsByLayoutId = formInputs.reduce((acc, input) => {
  //     const layoutId = input.formLayout.id;
  //     if (!acc[layoutId]) {
  //       acc[layoutId] = [];
  //     }
  //     acc[layoutId].push(input);
  //     return acc;
  //   }, {} as Record<number, FormInput[]>);

  //   function assignInputsToLayout(layout: any): any {
  //     const layoutInputs = inputsByLayoutId[layout.id] || [];
  //     const mappedInputs = layoutInputs.map((input) => ({
  //       id: input.id,
  //       type: input.type,
  //       config: {
  //         label: input.title,
  //         required: input.required,
  //       },
  //     }));

  //     let children = layout.children || [];
  //     if (children.length > 0) {
  //       children = children.map(assignInputsToLayout);
  //     }

  //     return {
  //       ...layout,
  //       items: mappedInputs,
  //       children: children,
  //     };
  //   }

  //   this.editorItems = this.editorItems.map(assignInputsToLayout);
  // }

  loadFormTemplateWithLayouts(id: string) {
    this.formTemplateService
      .getFullFormTemplate(+id)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading full form template:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (formTemplate) => {
          this.formTitle = formTemplate.title ?? '';
          
          if (formTemplate.formLayouts && formTemplate.formLayouts.length > 0) {
            this.editorItems = this.processFormLayouts(formTemplate.formLayouts);
            
            const allInputs = this.collectAllFormInputs(formTemplate.formLayouts);
            if (allInputs.length > 0) {
              this.loadFormInputsWithMultipleValues(allInputs);
            }
          } else {
            this.editorItems = [];
          }
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading form template:', error);
        }
      });
  }
  private processFormLayouts(layouts: any[]): any[] {
    return layouts.map(layout => {
      if (layout.type === 'Section') {
        const section = {
          id: layout.id,
          type: layout.type,
          title: layout.title,
          items: [], 
          children: [] 
        };
        
        // Process form inputs directly in this section
        if (layout.formInputs && layout.formInputs.length > 0) {
          section.items = layout.formInputs.map((input: any) => this.mapFormInputToEditorItem(input));
        }
        
        // Process subsections 
        if (layout.children && layout.children.length > 0) {
          section.children = layout.children.map((child: any) => {
            const subsection = {
              id: child.id,
              type: child.type,
              title: child.title,
              items: []
            };
            
            // Process form inputs in this subsection
            if (child.formInputs && child.formInputs.length > 0) {
              subsection.items = child.formInputs.map((input: any) => this.mapFormInputToEditorItem(input));
            }
            
            return subsection;
          });
        }
        
        return section;
      }
      
      return layout;
    });
  }
  
  private mapFormInputToEditorItem(input: any): any {
    let config;
    try {
      config = input.config ? JSON.parse(input.config) : {};
    } catch (e) {
      console.error('Error parsing input config:', e);
      config = {};
    }
    
    return {
      id: input.id,
      type: input.type,
      config: {
        ...config,
        label: input.title,
        required: input.required
      }
    };
  }
  
  private collectAllFormInputs(layouts: any[]): FormInput[] {
    const allInputs: FormInput[] = [];
    
    layouts.forEach(layout => {
      if (layout.formInputs && layout.formInputs.length > 0) {
        allInputs.push(...layout.formInputs);
      }
      
      if (layout.children && layout.children.length > 0) {
        layout.children.forEach((subsection: any) => {
          if (subsection.formInputs && subsection.formInputs.length > 0) {
            allInputs.push(...subsection.formInputs);
          }
        });
      }
    });
    
    return allInputs;
  }
  handleSubmit() {
    console.log('Starting form submission process');
    const sectionItemsMap = new Map<string, any[]>();
    // Assign temporary IDs to new sections and map their items

    this.editorItems.forEach((item) => {
      if (!item.id && item.type === 'Section') {
        item.tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (item.items) {
          const itemsWithSection = item.items.map((formItem: any) => ({
            ...formItem,
            tempSectionId: item.tempId,
          }));
          sectionItemsMap.set(item.tempId, itemsWithSection);
        }
      }
    });

    const layoutsToSave = this.editorItems.filter(
      (item) => !item.id && item.type === 'Section'
    );

    const saveSections$ = layoutsToSave.length > 0
      ? this.formTemplateService
          .addFormLayoutsToFormTemplate(+this.templateId, layoutsToSave)
          .pipe(
            takeUntil(this.destroy$),
            map((updatedFormTemplate: FormTemplate) => {
              const tempIdToSavedLayoutMap = new Map<string, any>();
              if (updatedFormTemplate.formLayouts) {
                const newLayouts = updatedFormTemplate.formLayouts
                  .filter(
                    (layout) =>
                      !this.editorItems.some((existing) => existing.id === layout.id)
                  )
                  .sort((a, b) => a.id - b.id);

                layoutsToSave.forEach((originalLayout, index) => {
                  if (originalLayout.tempId && newLayouts[index]) {
                    tempIdToSavedLayoutMap.set(
                      originalLayout.tempId,
                      newLayouts[index]
                    );
                  }
                });
              }

              this.editorItems = this.editorItems.map((item) => {
                if (item.tempId && tempIdToSavedLayoutMap.has(item.tempId)) {
                  const savedLayout = tempIdToSavedLayoutMap.get(item.tempId);
                  const originalItems = sectionItemsMap.get(item.tempId) || [];

                  return {
                    ...savedLayout,
                    type: 'Section',
                    items: originalItems.map((origItem) => ({
                      ...origItem,
                      tempSectionId: undefined,
                      targetSectionId: savedLayout.id,
                    })),
                  };
                }
                return item;
              });
            })
          )
      : of(null);

    const saveFormInputs$ = new Subject<void>();

    (saveSections$ as Observable<void>).subscribe({
      next: () => {
        this.saveFormInputsToSections(() => saveFormInputs$.next());
      },
      error: (error: any) => console.error('Error saving sections:', error),
    });

    (saveFormInputs$ as Observable<void>).subscribe({
      next: () => {
        console.log('All sections and form inputs saved successfully.');
        this.router.navigate(['/form-template']);
      },
      error: (error) => console.error('Error saving form inputs:', error),
    });
  }

  saveFormInputsToSections(onComplete?: () => void) {
    const formInputRequests: any[] = [];
    const multiChoiceItems: { item: any; layoutId: number }[] = [];
        this.editorItems.forEach((section) => {
      if (section.type === 'Section') {
        const sectionLayoutId = section.id;
  
        if (section.items?.length > 0) {
          section.items.forEach((item: any, itemIndex: number) => {
            if (item.id || !item.type || item.type === 'Section') {
              return;
            }
  
            this.prepareFormInputRequest(item, sectionLayoutId, itemIndex, formInputRequests, multiChoiceItems);
          });
        }
  
        if (section.children?.length > 0) {
          section.children.forEach((subsection: any) => {
            if (!subsection.id) {
              console.warn('Subsection has no ID, cannot add form inputs to it:', subsection);
              return;
            }
            
            const subsectionLayoutId = subsection.id;
            
            if (subsection.items?.length > 0) {
              subsection.items.forEach((item: any, itemIndex: number) => {
                if (item.id || !item.type || item.type === 'Subsection') {
                  return;
                }
  
                this.prepareFormInputRequest(item, subsectionLayoutId, itemIndex, formInputRequests, multiChoiceItems);
              });
            }
          });
        }
      }
    });
  
    if (formInputRequests.length === 0) {
      if (onComplete) onComplete();
      return;
    }
  
    const saveOperations: Observable<any>[] = formInputRequests.map(request => {
      const { formInput, formLayoutId } = request;
      
      let layout = null;
      for (const section of this.editorItems) {
        if (section.id === formLayoutId) {
          layout = section;
          break;
        }
        
        if (section.children) {
          const subsection = section.children.find((sub: any) => sub.id === formLayoutId);
          if (subsection) {
            layout = subsection;
            break;
          }
        }
      }
      
      if (!layout) {
        console.error(`Could not find layout with ID ${formLayoutId}`);
        return of(null);
      }
      
      if (layout.type === 'Subsection') {
        return this.formTemplateService.addFormInputToSubsection(formLayoutId, formInput)
          .pipe(
            catchError(error => {
              console.error(`Error saving form input to subsection ${formLayoutId}:`, error);
              return of(null);
            })
          );
      } else {
        return this.formTemplateService.addFormInputToLayout(formLayoutId, formInput)
          .pipe(
            catchError(error => {
              console.error(`Error saving form input to section ${formLayoutId}:`, error);
              return of(null);
            })
          );
      }
    });
  
    forkJoin(saveOperations)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedInputs) => {
          console.log('Form inputs saved successfully:', savedInputs);
          const validSavedInputs = savedInputs.filter(input => input !== null);
          this.processMultiChoiceItems(multiChoiceItems, validSavedInputs, onComplete);
        },
        error: (error) => {
          console.error('Error saving form inputs:', error);
          if (onComplete) onComplete();
        },
      });
  }
  

// Méthode helper pour préparer les requêtes
private prepareFormInputRequest(
  item: any,
  layoutId: number,
  itemIndex: number,
  formInputRequests: any[],
  multiChoiceItems: { item: any; layoutId: number }[]
) {
  const itemConfig = item.config || {};
  const itemTitle =
    itemConfig.label || itemConfig.groupLabel || itemConfig.title || '';

  formInputRequests.push({
    formInput: {
      type: item.type,
      title: itemTitle,
      config: JSON.stringify(itemConfig),
      required: itemConfig.isRequired || itemConfig.required || false,
      ordinalPosition: itemIndex,
    },
    formLayoutId: layoutId,
  });

  if (['CHECKBOX', 'SELECT_BOX', 'RADIO_BUTTON'].includes(item.type)) {
    multiChoiceItems.push({ item, layoutId });
  }
}

  resetForm() {
    this.editorItems = [];
    console.log('All items removed');
  }

addSubsection(section: any): void {
  const dialogRef = this.dialog.open(SubsectionConfigComponent, {
    width: '70vw',
    height: '50vh',
    data: { item: { name: 'Subsection' } },
    disableClose: false,
    panelClass: 'custom-dialog-container',
    backdropClass: 'custom-dialog-backdrop',
  });

  dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((subsectionResult) => {
    if (subsectionResult) {
      if (!section.children) {
        section.children = [];
      }
      
      section.children.push({
        ...subsectionResult,
        type: 'Subsection',
        items: []
      });
      
      this.cdr.detectChanges();
    }
  });
}
removeItem(item: any) {
  // First try to find and remove the item from the top level (sections)
  const topLevelIndex = this.editorItems.indexOf(item);

  if (topLevelIndex !== -1) {
      // Item is a section
      if (item.id) {
          // Optimistic update: immediately remove from UI first
          const removedItem = this.editorItems.splice(topLevelIndex, 1)[0];
          this.cdr.detectChanges();
          
          this.formLayoutService.deleteFormLayout(item.id).subscribe({
              next: () => {
                  console.log('Section deleted successfully:', item);
              },
              error: (err) => {
                  console.error('Error deleting section:', err);
                  // Optionally show user notification without reverting UI
                  // this.showErrorNotification('The section was removed from your view but the server update failed. Changes will sync when you reload.');
              },
          });
      } else {
          this.editorItems.splice(topLevelIndex, 1);
          this.cdr.detectChanges();
      }
      return;
  }

  // Search through nested structure
  for (const section of this.editorItems) {
      if (section.children) {
          const subsectionIndex = section.children.indexOf(item);
          if (subsectionIndex !== -1) {
              section.children.splice(subsectionIndex, 1);
              this.cdr.detectChanges();
              return;
          }
          
          for (const subsection of section.children || []) {
              if (subsection.items) {
                  const itemIndex = subsection.items.indexOf(item);
                  if (itemIndex !== -1) {
                      subsection.items.splice(itemIndex, 1);
                      this.cdr.detectChanges();
                      return;
                  }
              }
          }
      }
      
      if (section.items) {
          const itemIndex = section.items.indexOf(item);
          if (itemIndex !== -1) {
              if (item.id) {
                  // Optimistic update for form inputs
                  const removedInput = section.items.splice(itemIndex, 1)[0];
                  this.cdr.detectChanges();
                  
                  this.formInputService.deleteFormInput(item.id).subscribe({
                      next: () => {
                          console.log('Form input deleted successfully:', item);
                      },
                      error: (err) => {
                          console.error('Error deleting form input:', err);
                          // Optionally show user notification
                      },
                  });
              } else {
                  section.items.splice(itemIndex, 1);
                  this.cdr.detectChanges();
              }
              return;
          }
      }
  }
}
  getOptionsArray(options: string | string[] | any[]): string[] {
    if (Array.isArray(options)) {
      return options.map((opt) =>
        typeof opt === 'string' ? opt : JSON.stringify(opt)
      );
    }
    if (typeof options === 'string') {
      return options
        .split(',')
        .map((option) => option.trim())
        .filter((option) => option.length > 0);
    }
    return [];
  }

  onSectionItemDropped(event: CdkDragDrop<any[]>, section: any) {
    if (event.previousContainer === event.container) {
      // Move item within the same section
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Only update order for items that have IDs (saved items)
      const reorderedInputs = event.container.data.filter(
        (item: any) => item.id
      );
      if (reorderedInputs.length > 1 && section.id) {
        this.updateFormInputsOrder(reorderedInputs, section.id);
      }

      return;
    }
  }

  private processMultiChoiceItems(
    multiChoiceItems: { item: any; layoutId: number }[],
    savedInputs: any[],
    onComplete?: () => void
  ) {
    if (multiChoiceItems.length === 0) {
      // If there are no multi-choice items, immediately call onComplete
      if (onComplete) onComplete();
      return;
    }

    const saveRequests = multiChoiceItems.map(({ item, layoutId }) => {
      const itemTitle =
        item.config.label || item.config.groupLabel || item.config.title || '';

      const savedInput = savedInputs.find(
        (input) => input.type === item.type && input.title === itemTitle
      );

      if (!savedInput) {
        console.error('No matching saved input found for multi-choice item:', item);
        return of(null);
      }

      let options: any[] = [];
      if (item.type === 'CHECKBOX' || item.type === 'RADIO_BUTTON') {
        options = Array.isArray(item.config.options)
          ? item.config.options.map((opt: any) => {
              if (typeof opt === 'string' && (opt.startsWith('{') || opt.includes('label'))) {
                try {
                  return JSON.parse(opt);
                } catch (e) {
                  return { label: opt, value: opt };
                }
              } else if (typeof opt === 'object') {
                return { label: opt.label || '', value: opt.value || opt.label || '' };
              } else {
                return { label: opt, value: opt };
              }
            })
          : [];
      } else if (item.type === 'SELECT_BOX') {
        options = this.getOptionsArray(item.config.options);
      }

      if (options.length > 0) {
        const valuesForBackend =
          item.type === 'SELECT_BOX'
            ? options
            : options.map((opt) => (typeof opt === 'string' ? opt : JSON.stringify(opt)));

        const multipleValue = {
          valeurs: valuesForBackend,
          formInput: { id: savedInput.id },
        };

        return this.multipleValueService.createMultipleValue(multipleValue).pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            console.error('Error saving multiple values:', error);
            return of(null);
          })
        );
      }

      return of(null);
    });
    
    forkJoin(saveRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('All multiple values saved successfully.');
          if (onComplete) onComplete();
        },
        error: (error) => {
          console.error('Error processing multiple-choice items:', error);
          if (onComplete) onComplete();
        },
      });
  }
  onSubsectionItemDropped(event: CdkDragDrop<any[]>, subsection: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.cdr.detectChanges();
      return;
    }

    const draggedItem = event.item.data;

    if (draggedItem.name) {
      this.openDialog(
        this.getConfigComponent(draggedItem.name),
        draggedItem,
        0
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe((itemResult) => {
          if (itemResult) {
            if (!subsection.items) subsection.items = [];
            subsection.items.splice(event.currentIndex, 0, {
              ...itemResult,
              type: draggedItem.name 
            });
            this.cdr.detectChanges();
          }
        });
    }
    else {
      if (!subsection.items) subsection.items = [];
      
      if (event.previousContainer !== event.container) {
        event.previousContainer.data.splice(event.previousIndex, 1);
      }
      
      subsection.items.splice(event.currentIndex, 0, draggedItem);
      this.cdr.detectChanges();
    }
  }

  private loadFormInputsWithMultipleValues(inputs: FormInput[]) {
    const multiChoiceInputs = inputs.filter(
      (input) =>
        input.type === 'CHECKBOX' ||
        input.type === 'SELECT_BOX' ||
        input.type === 'RADIO_BUTTON'
    );
  
    if (multiChoiceInputs.length === 0) {
      return;
    }
  
    const requests = multiChoiceInputs.map((input) =>
      this.multipleValueService.getMultipleValuesByFormInputId(input.id).pipe(
        map((values) => ({ input, values })),
        catchError((error) => {
          console.error(
            `Error loading multiple values for input ${input.id}:`,
            error
          );
          return of({ input, values: [] });
        })
      )
    );
  
    // Execute all requests in parallel
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          results.forEach(({ input, values }) => {
            input.multipleValues = values as MultipleValue[];
            this.updateEditorItemWithMultipleValues(input);
          });
  
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading multiple values:', error);
        },
      });
  }
  

  private updateEditorItemWithMultipleValues(input: FormInput) {
    const updateItemConfig = (item: any) => {
      if (item.id === input.id) {
        if (!item.config) {
          item.config = {};
        }
  
        const values =
          input.multipleValues && input.multipleValues[0]
            ? input.multipleValues[0].valeurs
            : [];
  
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
    };
  
    this.editorItems.forEach((section) => {
      if (section.items) {
        section.items.forEach(updateItemConfig);
      }
      
      if (section.children) {
        section.children.forEach((subsection: any) => {
          if (subsection.items) {
            subsection.items.forEach(updateItemConfig);
          }
        });
      }
    });
  }
  private updateSectionOrder(orderedSections: any[]): void {
    const sectionOrder = orderedSections.map((section, index) => ({
      id: section.id,
      ordinalPosition: index,
      title: section.title,
      type: section.type,
    }));

    this.formTemplateService
      .updateFormLayoutsOrder(+this.templateId, sectionOrder)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Order updated successfully, no need to reload
        },
        error: (error) => {
          console.error('Error updating section order:', error);
        },
      });
  }

  private updateFormInputsOrder(orderedInputs: any[], sectionId: number): void {
    console.log('Updating form input order for section:', sectionId);

    const inputOrders = orderedInputs.map((input, index) => ({
      id: input.id,
      ordinalPosition: index,
      formLayoutId: sectionId,
    }));

    this.formTemplateService
      .updateFormInputsOrder(+this.templateId, inputOrders)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Form input order updated successfully:', result);
        },
        error: (error) => {
          console.error('Error updating form input order:', error);
        },
      });
  }
}