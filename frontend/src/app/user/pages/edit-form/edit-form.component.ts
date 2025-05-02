import { DialogModule } from '@angular/cdk/dialog';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TextformComponent } from '../../../components/textform/textform.component';
import { EmailComponent } from '../../../components/email/email.component';
import { CheckboxComponent } from '../../../components/checkbox/checkbox.component';
import { PhoneNumberComponent } from '../../../components/phone-number/phone-number.component';
import { RadioButtonComponent } from '../../../components/radio-button/radio-button.component';
import { SelectBoxComponent } from '../../../components/select-box/select-box.component';
import { DatepickerComponent } from '../../../components/datepicker/datepicker.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { BasicDatepickerComponent } from '../../../components/basic-datepicker/basic-datepicker.component';
import { TextAreaComponent } from '../../../components/text-area/text-area.component';
import { PasswordComponent } from '../../../components/password/password.component';
import { FormValueRequest } from '../../../model/FormValueRequest';
import { catchError, forkJoin, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormTemplateService } from '../../../services/form-template.service';
import { MultipleValueService } from '../../../services/multiple-value.service';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { FormInput } from '../../../model/FormInput';
import { MultipleValue } from '../../../model/MultipleValue';
import { finalize } from 'rxjs/operators'; // Add this import at the top

@Component({
  selector: 'app-edit-form',
  imports: [ CommonModule, CdkTreeModule, DialogModule,
    HttpClientModule, FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent, BasicDatepickerComponent, 
    TextAreaComponent, PasswordComponent],  
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css'
})
export class EditFormComponent {
  @Output() valueChange = new EventEmitter<any>();
  
  formTitle: string = '';
  private destroy$ = new Subject<void>();
  templateId!: string;
  editorItems: any[] = [];
  userId: number = 1; 
  formValues: Map<number, any> = new Map();
  validationErrors: string[] = [];
  showValidationErrors: boolean = false;
  submissionId!: number;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = true;

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
      const userId = params.get('userId');
      const submissionId = params.get('submissionId');
  
      if (!userId || !submissionId) {
        console.error('Missing parameters in the URL.');
        this.errorMessage = 'Paramètres manquants dans l\'URL. Veuillez vérifier l\'URL.';
        return;
      }
  
      this.userId = +userId;
      this.submissionId = +submissionId;
  
      this.loadFormTemplateWithSubmissionId(this.submissionId);
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFormTemplateWithSubmissionId(submissionId: number) {
    this.isLoading = true;
    this.formSubmissionService.getFormTemplateBySubmissionId(submissionId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(formTemplate => {
          console.log('Loaded form template:', formTemplate);
          
          // Add proper type annotations to the sort parameters
          this.editorItems = formTemplate.formLayouts
            ?.sort((a: {ordinalPosition?: number}, b: {ordinalPosition?: number}) => 
                (a.ordinalPosition || 0) - (b.ordinalPosition || 0)) || [];
            
          this.formTitle = formTemplate.title ?? '';
          this.templateId = formTemplate.id.toString();
          
          return this.formTemplateService.getFormInputsByTemplateId(formTemplate.id);
        }),
        switchMap(formInputs => {
          console.log('Loaded form inputs:', formInputs);
          this.populateFormInputsIntoLayouts(formInputs);
          
          const multipleValueRequests = this.loadFormInputsWithMultipleValues(formInputs);
          
          return forkJoin({
            formValues: this.formSubmissionService.getFormValuesBySubmissionId(this.submissionId),
            multipleValues: multipleValueRequests || of(null)
          });
        }),
        catchError(error => {
          console.error('Error in loading process:', error);
          this.errorMessage = 'Erreur lors du chargement du formulaire. Veuillez réessayer.';
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (results: { formValues: any[], multipleValues?: any }) => {
          console.log('Form values from submission:', results.formValues);
          this.populateFormWithSubmittedValues(results.formValues);
  
          this.traverseFormItems(this.editorItems, (item) => {
            if (item.type === 'CHECKBOX') {
              item.value = Array.isArray(item.value) 
                ? item.value.filter((v: string) => v.trim() !== '')
                : [];
            }
          });
          
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading form template with layouts and inputs:', error);
          this.errorMessage = 'Erreur lors du chargement du formulaire. Veuillez réessayer.';
        }
      });
  }

  private populateFormWithSubmittedValues(formValues: any[]) {
    if (!formValues || formValues.length === 0) {
      console.log('No form values to populate');
      return;
    }

    console.log('Populating form with', formValues.length, 'values');
    
    // Create a map of form values by input ID for quick lookup
    const formValuesByInputId = new Map<number, any>();
    
    formValues.forEach(formValue => {
      if (formValue.formInputs?.length) {
        const inputId = formValue.formInputs[0].id;
        formValuesByInputId.set(inputId, formValue);
        console.log(`Mapped value for input ID ${inputId}:`, formValue.value);
      }
    });
    
    // Count populated fields for validation
    let fieldsPopulated = 0;
    
    // Traverse all sections and their inputs
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id && item.type !== 'Section') {
        const formValue = formValuesByInputId.get(item.id);
        if (formValue) {
          this.applyFormValue(item, formValue.value);
          fieldsPopulated++;
        }
      }
    });
    
    console.log(`Populated ${fieldsPopulated} out of ${formValuesByInputId.size} form fields`);
    
    this.cdr.detectChanges();
  }

  // New helper method for type-safe value application
  private applyFormValue(item: any, value: any): void {
    if (item.type === 'CHECKBOX') {
      item.value = Array.isArray(value)
        ? value.filter((v: string) => v.trim() !== '')
        : typeof value === 'string'
        ? value.split(',').filter((v: string) => v.trim() !== '')
        : [];
    } else {
      item.value = value;
    }
    console.log(`Applied value to ${item.id} (${item.type}):`, item.value);
  }

  private loadFormInputsWithMultipleValues(inputs: FormInput[]) {
    const multiChoiceInputs = inputs.filter(input =>
      input.type === 'CHECKBOX' ||
      input.type === 'SELECT_BOX' ||
      input.type === 'RADIO_BUTTON'
    );
  
    if (multiChoiceInputs.length === 0) {
      return null;
    }
  
    const requests = multiChoiceInputs.map(input =>
      this.multipleValueService.getMultipleValuesByFormInputId(input.id).pipe(
        map(values => ({input, values})),
        catchError(error => {
          console.error(`Error loading multiple values for input ${input.id}:`, error);
          return of({input, values: []});
        })
      )
    );
  
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
      
    return forkJoin(requests);
  }
  


  private populateFormInputsIntoLayouts(formInputs: FormInput[]) {
    const inputsByLayoutId = formInputs.reduce((acc, input) => {
      if (!input.formLayout) {
        console.warn('Input has no formLayout:', input);
        return acc;
      }
      
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
        
        // Add proper type annotations here too
        const sortedInputs = [...layoutInputs].sort((a: FormInput, b: FormInput) => 
          (a.ordinalPosition || 0) - (b.ordinalPosition || 0));
          
        return {
          ...layout,
          items: sortedInputs.map(input => ({
            id: input.id, 
            type: input.type,
            ordinalPosition: input.ordinalPosition, // Preserve ordinalPosition
            config: {
              label: input.title,
              textName: input.title,
              placeholder: `Enter ${input.title}`,
              required: input.required,
              name: input.type.toLowerCase()
            }
          }))
        };
      }
      return layout;
    });
    
    console.log('Updated editor items with proper ordering:', this.editorItems);
  }

  private updateEditorItemWithMultipleValues(input: FormInput) {
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === input.id) {
        if (!item.config) {
          item.config = {};
        }

        if (!input.multipleValues || !input.multipleValues.length) {
          console.warn(`No multiple values found for input ${input.id}`);
          return;
        }

        const values = input.multipleValues[0]?.valeurs || [];
        
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
          item.config.options = values;
        }
        
        console.log(`Updated item ${input.id} with options:`, item.config.options);
      }
    });
  }

  getOptionsArray(options: string | string[] | any[]): string[] {
    if (!options) {
      return [];
    }
    
    if (Array.isArray(options)) {
      return options.map(opt => typeof opt === 'string' ? opt : JSON.stringify(opt));
    }
    
    if (typeof options === 'string') {
      return options.split(',').map(option => option.trim()).filter(option => option.length > 0);
    }
    
    return [];
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
  this.successMessage = '';
  this.errorMessage = '';
}

handleCheckboxChange(itemId: number, selectedOptions: string[]) {
  console.log('Checkbox change:', itemId, selectedOptions);
  
  this.traverseFormItems(this.editorItems, (item) => {
    if (item.id === itemId) {
      item.value = [...selectedOptions]; // Create new array reference
    }
  });
  
  this.formValues.set(itemId, selectedOptions);
  this.cdr.detectChanges();
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
    this.successMessage = '';
    this.errorMessage = '';
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
    this.successMessage = '';
    this.errorMessage = '';
  }

  validateForm(): boolean {
    this.validationErrors = [];
    let isValid = true;
  
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.config?.required) {
        const fieldValue = item.value;
        let isEmpty = false;
  
        if (item.type === 'CHECKBOX') {
          isEmpty = !Array.isArray(fieldValue) || 
                  fieldValue.length === 0 ||
                  fieldValue.every(v => typeof v === 'string' && v.trim() === '');
        } else {
          isEmpty = fieldValue === undefined || 
                  fieldValue === null ||
                  (typeof fieldValue === 'string' && fieldValue.trim() === '');
        }
  
        if (isEmpty) {
          this.validationErrors.push(`${item.config.label || 'Field'} is required`);
          isValid = false;
        }
      }
    });
  
    this.showValidationErrors = !isValid;
    return isValid;
  }

  collectFormValues(): FormValueRequest[] {
    const formValues: FormValueRequest[] = [];
  
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id && item.type !== 'Section') {
        let singleValue: any = null;
        let multipleValues: string[] = [];
  
        // Always include required fields even if empty
        const isRequired = item.config?.required === true;
  
        if (item.type === 'CHECKBOX') {
          multipleValues = Array.isArray(item.value)
            ? item.value.filter((v: string) => v.trim() !== '')
            : [];
        } 
        else if (item.type === 'RADIO_BUTTON') {
          multipleValues = item.value?.trim() ? [item.value.trim()] : [];
        } 
        else if (item.type === 'SELECT_BOX') {
          multipleValues = item.value ? [item.value] : [];
        } 
        else {
          singleValue = typeof item.value === 'string' 
            ? item.value.trim()
            : item.value;
        }
  
        // Always include required fields, even with empty values
        if (isRequired || singleValue !== null || multipleValues.length > 0) {
          formValues.push(new FormValueRequest(
            item.id,
            item.type === 'CHECKBOX' ? null : singleValue,
            multipleValues.length > 0 ? multipleValues : (isRequired ? [] : null)
          ));
        }
      }
    });
  
    console.log('Form values payload:', JSON.stringify(formValues, null, 2));
    return formValues;
  }

  traverseFormItems(items: any[], callback: (item: any) => void) {
    if (!items) return;
    
    items.forEach(item => {
      if (item.type === 'Section' && item.items) {
        this.traverseFormItems(item.items, callback);
      } else {
        callback(item);
      }
    });
  }

  onSubmit() {
    if (this.isSubmitting) return;
    
    this.successMessage = '';
    this.errorMessage = '';
  
    if (!this.validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
  
    const formValues = this.collectFormValues();
    
    // Ensure even empty checkbox arrays are sent as null
    const cleanedValues = formValues.map(value => ({
      ...value,
      multipleValues: value.multipleValues?.length ? value.multipleValues : null
    }));
  
    console.log('Final submission payload:', cleanedValues);
    
    this.isSubmitting = true;
    
    this.formSubmissionService.updateFormSubmission(this.userId, this.submissionId, cleanedValues)
      .pipe(
        finalize(() => this.isSubmitting = false),
        catchError(error => {
          console.error('Update error:', error.error);
          this.errorMessage = error.error?.message || 'Update failed. Please check your input.';
          window.scrollTo(0, 0);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Form submission updated successfully:', response);
          this.isSubmitting = false;
          this.successMessage = 'Le formulaire a été mis à jour avec succès.';
          this.router.navigate(['/list']);
        },
    
      });
  }

  onCancel(): void {
    this.router.navigate(['/list']);
    
}}
