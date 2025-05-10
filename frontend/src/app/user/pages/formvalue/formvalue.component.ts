import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule} from '@angular/common';
import { DialogModule } from '@angular/cdk/dialog';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TextformComponent } from '../../../components/textform/textform.component';
import { EmailComponent } from "../../../components/email/email.component";
import { CheckboxComponent } from "../../../components/checkbox/checkbox.component";
import { PhoneNumberComponent } from "../../../components/phone-number/phone-number.component";
import { RadioButtonComponent } from "../../../components/radio-button/radio-button.component";
import { SelectBoxComponent } from "../../../components/select-box/select-box.component";
import { DatepickerComponent } from "../../../components/datepicker/datepicker.component";
import { ButtonComponent } from "../../../components/button/button.component";      
import { BasicDatepickerComponent } from "../../../components/basic-datepicker/basic-datepicker.component"; 
import { TextAreaComponent } from '../../../components/text-area/text-area.component';
import { PasswordComponent } from '../../../components/password/password.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormTemplateService } from '../../../services/form-template.service';
import { MultipleValueService } from '../../../services/multiple-value.service';
import { catchError, forkJoin, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { FormInput } from '../../../model/FormInput';
import { MultipleValue } from '../../../model/MultipleValue';
import { FormValueRequest } from '../../../model/FormValueRequest';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { ProcessSelectorComponent } from '../../../components/process-selector/process-selector.component';


@Component({
  selector: 'app-formvalue',
  imports: [
    CommonModule, CdkTreeModule, DialogModule,
    HttpClientModule, FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent, 
    BasicDatepickerComponent, TextAreaComponent, PasswordComponent,
    ProcessSelectorComponent
  ],
  templateUrl: './formvalue.component.html',
  styleUrl: './formvalue.component.css'
})
export class FormvalueComponent {
  @Output() valueChange = new EventEmitter<any>();

  formTitle: string = '';
  private destroy$ = new Subject<void>();
  templateId!: string;
  editorItems: any[] = [];
  userId: number = 1; 
  formValues: Map<number, any> = new Map();
  validationErrors: string[] = [];
  showValidationErrors: boolean = false;
  isFormSubmitted: boolean = false; 
  submissionMessage: string = ''; 

  // Add this property
  selectedProcessKey: string = '';

  onInputChange(event: any) {
    this.valueChange.emit(event.target.value);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formTemplateService: FormTemplateService,
    private cdr: ChangeDetectorRef, 
    private multipleValueService: MultipleValueService, 
    private formSubmissionService: FormSubmissionService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadFormTemplateWithLayouts(this.templateId);
      this.checkFormSubmissionStatus();

    });
  }

  checkFormSubmissionStatus() {
    this.formSubmissionService
      .checkIfSubmissionExists(this.userId, +this.templateId)
      .subscribe((exists) => {
        if (exists) {
          this.isFormSubmitted = true;
          this.submissionMessage = 'You have already submitted this form.';
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
      // Process section
      if (layout.type === 'Section') {
        const section = {
          id: layout.id,
          type: layout.type,
          title: layout.title,
          items: [],
          children: [] 
        };
        
        if (layout.formInputs && layout.formInputs.length > 0) {
          section.items = layout.formInputs.map((input: any) => this.mapFormInputToEditorItem(input));
        }
        
        if (layout.children && layout.children.length > 0) {
          section.children = layout.children.map((child: any) => {
            const subsection = {
              id: child.id,
              type: child.type,
              title: child.title,
              items: []
            };
            
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

  getOptionsArray(options: string | string[] | any[]): string[] {
    if (Array.isArray(options)) {
      return options.map(opt => typeof opt === 'string' ? opt : JSON.stringify(opt));
    }
    if (typeof options === 'string') {
      return options.split(',').map(option => option.trim()).filter(option => option.length > 0);
    }
    return [];
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
            id: input.id, 
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
    const updateItemWithValues = (item: any) => {
      if (item.id === input.id) {
        if (!item.config) {
          item.config = {};
        }
  
        const values = input.multipleValues && input.multipleValues[0] ?
          input.multipleValues[0].valeurs : [];
  
        if (input.type === 'RADIO_BUTTON') {
          item.config.options = values.map((val: string) => {
            try {
              if (typeof val === 'string' && val.startsWith('{')) {
                return JSON.parse(val);
              }
              return {label: val, value: val};
            } catch (e) {
              console.error('Error parsing value:', val, e);
              return {label: val, value: val};
            }
          });
        } else if (input.type === 'CHECKBOX') {
          item.config.options = values.map((val: string) => {
            try {
              if (typeof val === 'string' && val.startsWith('{')) {
                return JSON.parse(val);
              }
              return {label: val, value: val};
            } catch (e) {
              console.error('Error parsing value:', val, e);
              return {label: val, value: val};
            }
          });
        } else if (input.type === 'SELECT_BOX') {
          item.config.options = values.join(',');
        }
      }
    };
  
    this.editorItems.forEach(section => {
      if (section.type === 'Section') {
        if (section.items) {
          section.items.forEach(updateItemWithValues);
        }
        
        if (section.children && section.children.length > 0) {
          section.children.forEach((subsection: any) => {
            if (subsection.items && subsection.items.length > 0) {
              subsection.items.forEach(updateItemWithValues);
            }
          });
        }
      }
    });
  }

  handleInputChange(itemId: number, value: any) {
    console.log(`Input change for item ${itemId}:`, value);
    this.formValues.set(itemId, value);
    
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === itemId) {
        item.value = value;
      }
    });
    
    this.showValidationErrors = false;
  }

  validateForm(): boolean {
    this.validationErrors = [];
    let isValid = true;
    
    const requiredFields: any[] = [];
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.config && item.config.required === true) {
        requiredFields.push({
          id: item.id,
          label: item.config.label,
          type: item.type,
          value: item.value
        });
      }
    });
    
    requiredFields.forEach(field => {
      if (field.value === undefined || field.value === null || field.value === '') {
        this.validationErrors.push(`${field.label} is required`);
        isValid = false;
      } else if (Array.isArray(field.value) && field.value.length === 0) {
        this.validationErrors.push(`${field.label} is required`);
        isValid = false;
      }
    });
    
    this.showValidationErrors = !isValid;
    return isValid;
  }

  // Add this method to handle process selection
  onProcessSelected(processKey: string) {
    console.log('Selected process key:', processKey);
    this.selectedProcessKey = processKey;
  }

  submitForm() {
    if (this.isFormSubmitted) {
      alert('You have already submitted this form.');
      console.warn('You have already submitted this form.');
      return;
    }
    
    if (!this.validateForm()) {
      return; 
    }
    
    // Check if a process has been selected
    if (!this.selectedProcessKey) {
      this.validationErrors.push('Please select a workflow process');
      this.showValidationErrors = true;
      return;
    }
    
    const formValues = this.collectFormValues();
    
    // Call the new method with process key
    this.formSubmissionService
      .submitFormWithProcess(this.userId, +this.templateId, formValues, this.selectedProcessKey)
      .subscribe({
        next: (result) => {
          this.isFormSubmitted = true; 
          this.router.navigate(['/forms']); 
        },
        error: (error) => {
          console.error('Error submitting form:', error);
          
          if (error.status === 404 && error.error.includes('No deployment found')) {
            this.validationErrors = ['The selected process is not properly deployed. Please select another process.'];
            this.showValidationErrors = true;
          }
        },
      });
  }
  disableFormFields() {
    this.traverseFormItems(this.editorItems, (item) => {
      item.disabled = this.isFormSubmitted;
    });
  }


  clearForm() {
    this.formValues = new Map();
    
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id) {
        item.value = undefined;
      }
    });
  }

  collectFormValues(): FormValueRequest[] {
    const formValues: FormValueRequest[] = [];
    this.traverseFormItems(this.editorItems, (item) => {
        if (item.id && item.value !== undefined) {
            console.log(`Item ${item.id} (${item.type}):`, item.value);
            let singleValue = null;
            let multipleValues = null;

            if (item.type === 'RADIO_BUTTON') {
                multipleValues = [item.value];
            } else if (item.type === 'CHECKBOX') {
                multipleValues = Array.isArray(item.value) ? item.value : [item.value];
            } else if (item.type === 'SELECT_BOX') {
                multipleValues = [item.value];
            } else {
                singleValue = item.value;
            }

            formValues.push(new FormValueRequest(
                item.id,
                singleValue,
                multipleValues
            ));
        }
    });
    return formValues;
}

traverseFormItems(items: any[], callback: (item: any) => void) {
  if (!items) return;
  items.forEach(item => {
      if (item.type === 'Section' && item.items) {
          this.traverseFormItems(item.items, callback);
          if (item.children && item.children.length > 0) {
              item.children.forEach((subsection: any) => {
                  if (subsection.items && subsection.items.length > 0) {
                      this.traverseFormItems(subsection.items, callback);
                  }
              });
          }
      } else {
          callback(item);
      }
  });
}

  handleCheckboxChange(itemId: number, selectedLabels: string[]) {
    console.log(`Checkbox change for item ${itemId}:`, selectedLabels);
    
    this.formValues.set(itemId, selectedLabels);
    
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === itemId) {
        item.value = selectedLabels; 
      }
    });
    
    this.showValidationErrors = false;
  }

  handleRadioChange(itemId: number, selectedValue: string) {
    console.log(`Radio button change for item ${itemId}:`, selectedValue);
    this.formValues.set(itemId, selectedValue);

    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === itemId) {
        item.value = selectedValue;
      }
    });
    
    this.showValidationErrors = false;
  }

  handleSelectBoxChange(itemId: number, selectedValue: string) {
    console.log(`Select box change for item ${itemId}:`, selectedValue);
    
    this.formValues.set(itemId, selectedValue);
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === itemId) {
        item.value = selectedValue;
      }
    });
    
    this.showValidationErrors = false;
  }
}