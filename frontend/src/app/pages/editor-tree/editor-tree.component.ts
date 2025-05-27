import { Component, ViewChild,inject,Output,EventEmitter,OnInit,Input,OnDestroy} from '@angular/core';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
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
import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
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
import { faBars} from '@fortawesome/free-solid-svg-icons';
import { GenericFormInputEditorComponent } from '../../configurations/generic-form-input-editor/generic-form-input-editor.component';
import { ReactiveFormsModule } from '@angular/forms';

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
    TextAreaComponent,PasswordComponent,DragDropModule,    FontAwesomeModule,ReactiveFormsModule
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
    library.addIcons(faTrashAlt, faPlus,faBars,faEdit
    );
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
        required: input.required,
        isRequired: input.required
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
  console.log('Current editorItems:', this.editorItems);
  const sectionItemsMap = new Map<string, any[]>();
  const subsectionItemsMap = new Map<string, any[]>();

  // Process all sections (both new and existing)
  this.editorItems.forEach((item) => {
    if (item.type === 'Section') {
      console.log(`Processing section: ${item.title || 'Untitled'}, ID: ${item.id || 'NEW'}`);

      // Only assign tempId to new sections (without ID)
      if (!item.id) {
        item.tempId = `temp_section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`Assigned tempId to new section: ${item.tempId}`);
        if (item.items) {
          const itemsWithSection = item.items.map((formItem: any) => ({
            ...formItem,
            tempSectionId: item.tempId,
          }));
          sectionItemsMap.set(item.tempId, itemsWithSection);
          console.log(`Added ${item.items.length} items to new section`);
        }
      } else {
        console.log(`Existing section with ID ${item.id} has ${item.items?.length || 0} items`);
      }

      // Process subsections for both new and existing sections
      if (item.children && item.children.length > 0) {
        item.children.forEach((subsection: any) => {
          if (!subsection.id && subsection.type === 'Subsection') {
            subsection.tempId = `temp_subsection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // For new sections, use tempId; for existing sections, use actual ID
            subsection.parentSectionTempId = item.tempId || item.id;

            if (subsection.items && subsection.items.length > 0) {
              const itemsWithSubsection = subsection.items.map((formItem: any) => ({
                ...formItem,
                tempSubsectionId: subsection.tempId
              }));
              subsectionItemsMap.set(subsection.tempId, itemsWithSubsection);
            }
          }
        });
      }
    }
  });

  // Only save sections that are actually new (don't have IDs)
  const layoutsToSave = this.editorItems.filter(
    (item) => !item.id && item.type === 'Section'
  );

  console.log(`Found ${layoutsToSave.length} new sections to save`);

  // Create a sequential flow that handles all cases
  const executeFlow = () => {
    // Step 1: Save new sections (if any)
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

                  let updatedChildren = [];
                  if (item.children && item.children.length > 0) {
                    updatedChildren = item.children.map((subsection: any) => {
                      if (subsection.parentSectionTempId === item.tempId) {
                        return {
                          ...subsection,
                          parentSectionId: savedLayout.id
                        };
                      }
                      return subsection;
                    });
                  }

                  return {
                    ...savedLayout,
                    type: 'Section',
                    children: updatedChildren,
                    items: originalItems.map((origItem) => ({
                      ...origItem,
                      tempSectionId: undefined,
                      targetSectionId: savedLayout.id,
                    })),
                  };
                }
                return item;
              });
              console.log('Sections saved successfully');
              return true;
            })
          )
      : of(true); // Return true immediately if no sections to save

    // Step 2: Save new subsections (if any)
    const saveSubsections$ = saveSections$.pipe(
      switchMap(() => {
        return new Observable(observer => {
          this.saveSubsectionsToSections(() => {
            console.log('Subsections processing completed');
            observer.next(true);
            observer.complete();
          });
        });
      })
    );

    // Step 3: Save new form inputs (if any)
    const saveFormInputs$ = saveSubsections$.pipe(
      switchMap(() => {
        return new Observable(observer => {
          this.saveFormInputsToSections(() => {
            console.log('Form inputs processing completed');
            observer.next(true);
            observer.complete();
          });
        });
      })
    );

    // Execute the flow
    saveFormInputs$.subscribe({
      next: () => {
        console.log('All sections, subsections and form inputs saved successfully.');
        this.router.navigate(['admin/form-template']);
      },
      error: (error) => {
        console.error('Error in save flow:', error);
      }
    });
  };

  // Start the execution
  executeFlow();
}

  saveSubsectionsToSections(onComplete?: () => void) {
    const subsectionRequests: Observable<any>[] = [];

    this.editorItems.forEach((section) => {
      if (section.type === 'Section' && section.id) {
        const sectionId = section.id;

        if (section.children?.length > 0) {
          section.children.forEach((subsection: any) => {
            if (!subsection.id && subsection.type === 'Subsection') {
              const subsectionData = {
                title: subsection.title || 'Subsection',
                type: 'Subsection',
                formTemplate: { id: +this.templateId }
              };

              const saveSubsection$ = this.formTemplateService.addSubsectionToSection(sectionId, subsectionData)
                .pipe(
                  catchError(error => {
                    console.error(`Error saving subsection to section ${sectionId}:`, error);
                    return of(null);
                  }),
                  map(savedSubsection => {
                    if (savedSubsection) {
                      const subsectionIndex = section.children.findIndex((s: any) => s === subsection);
                      if (subsectionIndex !== -1) {
                        section.children[subsectionIndex] = {
                          ...savedSubsection,
                          type: 'Subsection',
                          items: subsection.items || []
                        };

                        if (subsection.tempId && subsection.items?.length > 0) {
                          subsection.items.forEach((item: any) => {
                            item.tempSubsectionId = undefined;
                            item.targetSubsectionId = savedSubsection.id;
                          });
                        }
                      }
                    }
                    return savedSubsection;
                  })
                );

              subsectionRequests.push(saveSubsection$);
            }
          });
        }
      }
    });

    if (subsectionRequests.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    forkJoin(subsectionRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedSubsections) => {
          console.log('Subsections saved successfully:', savedSubsections);
          if (onComplete) onComplete();
        },
        error: (error) => {
          console.error('Error saving subsections:', error);
          if (onComplete) onComplete();
        }
      });
  }

  saveFormInputsToSections(onComplete?: () => void) {
    const formInputRequests: any[] = [];
    const multiChoiceItems: { item: any; layoutId: number }[] = [];

    this.editorItems.forEach((section) => {
      if (section.type === 'Section') {
        const sectionLayoutId = section.id;

        // Skip sections that don't have an ID (they haven't been saved yet)
        if (!sectionLayoutId) {
          console.warn('Section has no ID, skipping form inputs for this section:', section);
          return;
        }

        if (section.items?.length > 0) {
          section.items.forEach((item: any, itemIndex: number) => {
            // Only skip items that have an ID (already saved) or are not form inputs
            if (item.id || !item.type || item.type === 'Section') {
              return;
            }

            // Only process items that don't have an ID (new items that need to be saved)
            console.log(`Processing new item in section ${sectionLayoutId}:`, item);
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
                // Only skip items that have an ID (already saved) or are not form inputs
                if (item.id || !item.type || item.type === 'Subsection') {
                  return;
                }

                // Only process items that don't have an ID (new items that need to be saved)
                this.prepareFormInputRequest(item, subsectionLayoutId, itemIndex, formInputRequests, multiChoiceItems);
              });
            }
          });
        }
      }
    });

    console.log('Form inputs to save:', formInputRequests.length);
    if (formInputRequests.length === 0) {
      console.log('No new form inputs to save, completing...');
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

      console.log(`Saving form input to ${layout.type} with ID ${formLayoutId}:`, formInput);

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

          // Update the items with their new IDs from the server response
          this.updateItemsWithSavedIds(validSavedInputs, formInputRequests);

          this.processMultiChoiceItems(multiChoiceItems, validSavedInputs, onComplete);
        },
        error: (error) => {
          console.error('Error saving form inputs:', error);
          if (onComplete) onComplete();
        },
      });
  }

  // Helper method to update items with their saved IDs from server response
  private updateItemsWithSavedIds(savedInputs: any[], formInputRequests: any[]): void {
    savedInputs.forEach((savedInput, index) => {
      if (savedInput && formInputRequests[index]) {
        const { formLayoutId } = formInputRequests[index];
        const savedInputTitle = savedInput.title;

        // Find the corresponding item in editorItems and update it with the ID
        this.editorItems.forEach((section) => {
          if (section.type === 'Section') {
            // Check section items
            if (section.items && section.id === formLayoutId) {
              const itemToUpdate = section.items.find((item: any) =>
                !item.id &&
                item.type === savedInput.type &&
                (item.config?.label || item.config?.groupLabel || item.config?.title || '') === savedInputTitle
              );
              if (itemToUpdate) {
                itemToUpdate.id = savedInput.id;
                console.log(`Updated item with ID ${savedInput.id}:`, itemToUpdate);
              }
            }

            // Check subsection items
            if (section.children) {
              section.children.forEach((subsection: any) => {
                if (subsection.items && subsection.id === formLayoutId) {
                  const itemToUpdate = subsection.items.find((item: any) =>
                    !item.id &&
                    item.type === savedInput.type &&
                    (item.config?.label || item.config?.groupLabel || item.config?.title || '') === savedInputTitle
                  );
                  if (itemToUpdate) {
                    itemToUpdate.id = savedInput.id;
                    console.log(`Updated subsection item with ID ${savedInput.id}:`, itemToUpdate);
                  }
                }
              });
            }
          }
        });
      }
    });
  }

// Helper method to prepare form input requests
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
    const sectionId = section.id;

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
        const subsectionData = {
          ...subsectionResult,
          type: 'Subsection',
          formTemplate: { id: +this.templateId }
        };

        if (sectionId) {
          this.formTemplateService.addSubsectionToSection(sectionId, subsectionData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (savedSubsection) => {
                if (!section.children) {
                  section.children = [];
                }

                section.children.push({
                  ...savedSubsection,
                  type: 'Subsection',
                  items: []
                });

                console.log('Subsection added successfully:', savedSubsection);
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error adding subsection:', error);
              }
            });
        } else {
          if (!section.children) {
            section.children = [];
          }

          section.children.push({
            ...subsectionData,
            tempId: `temp_subsection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            items: []
          });

          this.cdr.detectChanges();
        }
      }
    });
  }
removeItem(item: any) {
  const topLevelIndex = this.editorItems.indexOf(item);
  if (topLevelIndex !== -1) {
    if (item.id) {
      const removedItem = this.editorItems.splice(topLevelIndex, 1)[0];
      this.cdr.detectChanges();

      this.formLayoutService.deleteFormLayout(item.id).subscribe({
        next: () => console.log('Section deleted:', item.id),
        error: (err) => {
          console.error('Error deleting section:', err);
        }
      });
    } else {
      this.editorItems.splice(topLevelIndex, 1);
      this.cdr.detectChanges();
    }
    return;
  }

  for (const section of this.editorItems) {
    if (section.children) {
      const subsectionIndex = section.children.indexOf(item);
      if (subsectionIndex !== -1) {
        if (item.id) {
          // Supprimer via l'API
          section.children.splice(subsectionIndex, 1);
          this.cdr.detectChanges();

          this.formLayoutService.deleteSubsection(item.id).subscribe({
            next: () => console.log('Subsection deleted:', item.id),
            error: (err) => {
              console.error('Error deleting subsection:', err);
            }
          });
        } else {
          section.children.splice(subsectionIndex, 1);
          this.cdr.detectChanges();
        }
        return;
      }
    }

    if (section.items) {
      const inputIndex = section.items.indexOf(item);
      if (inputIndex !== -1) {
        if (item.id) {
          const removedInput = section.items.splice(inputIndex, 1)[0];
          this.cdr.detectChanges();

          this.formInputService.deleteFormInput(item.id).subscribe({
            next: () => console.log('Form input deleted:', item.id),
            error: (err) => {
              console.error('Error deleting form input:', err);
            }
          });
        } else {
          section.items.splice(inputIndex, 1);
          this.cdr.detectChanges();
        }
        return;
      }
    }

    if (section.children) {
      for (const subsection of section.children) {
        if (subsection.items) {
          const inputIndex = subsection.items.indexOf(item);
          if (inputIndex !== -1) {
            if (item.id) {
              subsection.items.splice(inputIndex, 1);
              this.cdr.detectChanges();

              this.formInputService.deleteFormInput(item.id).subscribe({
                next: () => console.log('Nested form input deleted:', item.id),
                error: (err) => {
                  console.error('Error deleting nested form input:', err);
                }
              });
            } else {
              subsection.items.splice(inputIndex, 1);
              this.cdr.detectChanges();
            }
            return;
          }
        }
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
  onSubsectionItemDropped(event: CdkDragDrop<any[]>, subsection: any): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        subsection.items,
        event.previousIndex,
        event.currentIndex
      );

      subsection.items = [...subsection.items];

      const updatedItems = subsection.items
        .filter((item: any) => item.id)
        .map((item: any, index: number) => ({
          id: item.id,
          ordinalPosition: index
        }));

      if (updatedItems.length > 0) {
        this.formTemplateService.updateSubsectionItemsOrder(
          +this.templateId,
          subsection.id,
          updatedItems
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => console.log('Ordre des items sauvegardé'),
          error: err => console.error('Échec de sauvegarde:', err)
        });
      }
    }
  }

  onSubsectionDrop(event: CdkDragDrop<any[]>, section: any) {
    if (event.previousContainer === event.container && section.children) {
      moveItemInArray(section.children, event.previousIndex, event.currentIndex);

      section.children.forEach((subsection: any, index: number) => {
        subsection.ordinalPosition = index;
      });

      const reorderedSubsections = section.children
        .filter((subsection: any) => subsection.id)
        .map((subsection: any, index: number) => ({
          id: subsection.id,
          ordinalPosition: index
        }));

      const templateIdNumber = +this.templateId;
      const sectionIdNumber = +section.id;

      if (!this.templateId || isNaN(templateIdNumber)) {
        console.warn('Invalid templateId');
        return;
      }

      if (!section.id || isNaN(sectionIdNumber)) {
        console.warn('Invalid sectionId');
        return;
      }

      console.log('Updating subsection order with:', {
        templateId: templateIdNumber,
        sectionId: sectionIdNumber,
        subsections: reorderedSubsections
      });

      this.formTemplateService.updateSubsectionOrder(templateIdNumber, sectionIdNumber, reorderedSubsections)
        .subscribe({
          next: (response) => {
            console.log('Subsection order updated successfully', response);
          },
          error: (err) => {
            console.error("Error updating subsection order", err);
          }
        });
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

        const multipleValues = Array.isArray(input.multipleValues) ? input.multipleValues : [];
        console.log('Multiple values for input', input.id, ':', multipleValues);
        const values = multipleValues.map(mv => mv.valeurs).flat();
        console.log('Extracted values:', values);

        if (input.type === 'CHECKBOX' || input.type === 'RADIO_BUTTON') {
          // Pour CHECKBOX et RADIO_BUTTON, normaliser toutes les valeurs au format {label, value}
          item.config.options = values.map((val: string) => {
            try {
              if (typeof val === 'string') {
                if (val.startsWith('{')) {
                  return JSON.parse(val);
                } else {
                  return { label: val, value: val };
                }
              } else if (typeof val === 'object' && val !== null) {
                return val;
              }
              return { label: String(val), value: String(val) };
            } catch (e) {
              console.error('Error processing value:', val, e);
              return { label: String(val), value: String(val) };
            }
          });
          console.log('Updated config options for', input.type, ':', item.config.options);
        } else if (input.type === 'SELECT_BOX') {
          item.config.options = values;
          item.config.optionsString = values.join(', ');
          console.log('Updated SELECT_BOX options:', item.config.options);
        }

        item.multipleValues = multipleValues;
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
  editItem(item: any): void {
    if (item.type === 'Section') {
      const dialogRef = this.dialog.open(SectionConfigComponent, {
        data: {
          item: item,
          mode: 'edit' as const
        }
      });

      dialogRef.closed.subscribe((updatedSection) => {
        if (updatedSection) {
          this.handleUpdateSection(item, updatedSection);
        }
      });
    } else if (item.type === 'Subsection') {
      const dialogRef = this.dialog.open(SubsectionConfigComponent, {
        data: {
          item: item,
          mode: 'edit' as const
        }
      });

      dialogRef.closed.subscribe((updatedSubsection) => {
        if (updatedSubsection) {
          this.handleUpdateSubsection(item, updatedSubsection);
        }
      });
    } else {
      const dialogRef = this.dialog.open(GenericFormInputEditorComponent, {
        width: '70vw',
        height: '55vh',
        data: { item: item },
        disableClose: false,
        panelClass: 'custom-dialog-container',
        backdropClass: 'custom-dialog-backdrop',
      });

      dialogRef.closed.subscribe((updatedItem) => {
        if (updatedItem) {
          Object.assign(item, updatedItem);
          this.cdr.detectChanges();
        }
      });
    }
  }
  handleUpdateSection(oldSection: any, updatedSection: any): void {
    const topLevelIndex = this.editorItems.indexOf(oldSection);

    let sectionToUpdate = {
      ...oldSection,
      title: updatedSection.title,
      config: {
        ...oldSection.config,
        title: updatedSection.title
      }
    };

    if (!sectionToUpdate.children && oldSection.children) {
      sectionToUpdate.children = [...oldSection.children];
    }

    if (!sectionToUpdate.items && oldSection.items) {
      sectionToUpdate.items = [...oldSection.items];
    }

    if (topLevelIndex !== -1) {
      this.editorItems[topLevelIndex] = sectionToUpdate;
    } else {
      for (const section of this.editorItems) {
        if (section.children) {
          const subIndex = section.children.indexOf(oldSection);
          if (subIndex !== -1) {
            section.children[subIndex] = sectionToUpdate;
            break;
          }
        }
      }
    }

    if (sectionToUpdate.id) {
      const updatePayload = {
        title: sectionToUpdate.title
      };

      this.formLayoutService.updateFormLayout(sectionToUpdate.id, updatePayload).subscribe({
        next: (response) => {
          console.log('Section mise à jour sur le serveur:', response);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour de la section:", err);
        }
      });
    } else {
      console.warn("Impossible de mettre à jour cette section : ID manquant");
    }
  }
  handleUpdateSubsection(oldSubsection: any, updatedSubsection: any): void {
    let subsectionToUpdate = {
      ...oldSubsection,
      title: updatedSubsection.title,
      config: {
        ...oldSubsection.config,
        title: updatedSubsection.title,
        children: updatedSubsection.config?.children || oldSubsection.config?.children || []
      }
    };

    if (oldSubsection.items && !updatedSubsection.items) {
      subsectionToUpdate.items = oldSubsection.items;
    }

    for (const section of this.editorItems) {
      if (section.children) {
        const subIndex = section.children.indexOf(oldSubsection);
        if (subIndex !== -1) {
          section.children[subIndex] = subsectionToUpdate;

          if (subsectionToUpdate.id) {
            this.formLayoutService.updateFormLayout(subsectionToUpdate.id, {
              title: subsectionToUpdate.title,
              children: subsectionToUpdate.config?.children || []

            })
              .subscribe({
                next: (response) => {
                  console.log('Subsection mise à jour sur le serveur:', response);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error("Erreur lors de la mise à jour de la subsection:", err);
                }
              });
          }

          break;
        }
      }
    }
  }
}