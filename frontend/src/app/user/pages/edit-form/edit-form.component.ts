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

  loadFormTemplateWithSubmissionId(submissionId: number) {
    this.formSubmissionService.getFormTemplateBySubmissionId(submissionId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(formTemplate => {
          console.log('Loaded form template:', formTemplate);
          this.editorItems = formTemplate.formLayouts || [];
          this.formTitle = formTemplate.title ?? '';
          this.templateId = formTemplate.id.toString();
          
          return this.formTemplateService.getFormInputsByTemplateId(formTemplate.id).pipe(
            map(formInputs => ({ formTemplate, formInputs }))
          );
        }),
        switchMap(({ formTemplate, formInputs }) => {
          console.log('Loaded form inputs:', formInputs);
          this.populateFormInputsIntoLayouts(formInputs);
          
          const multipleValueRequests = this.loadFormInputsWithMultipleValues(formInputs);
          
          return forkJoin({
            formValues: this.formSubmissionService.getFormValuesBySubmissionId(this.submissionId),
            multipleValues: multipleValueRequests ? multipleValueRequests : of(null)
          }).pipe(
            map(results => ({
              formTemplate,
              formInputs,
              formValues: results.formValues
            }))
          );
        }),
        catchError(error => {
          console.error('Error in loading process:', error);
          this.errorMessage = 'Erreur lors du chargement du formulaire. Veuillez réessayer.';
          return throwError(() => error);
        })
      )
      .subscribe({
        next: ({ formTemplate, formInputs, formValues }) => {
          console.log('Form values from submission:', formValues);
          this.populateFormWithSubmittedValues(formValues);
          
          this.cdr.detectChanges();
        },
        error: (error) => {
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
    
    console.log('Populating form with values:', formValues);
    
    const formInputs: any[] = [];
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id && item.type && item.type !== 'Section') {
        formInputs.push(item);
      }
    });
    
    if (formValues.length === 1 && formInputs.length === 1) {
      const formValue = formValues[0];
      const formInput = formInputs[0];
      
      console.log(`Auto-matching form value ID ${formValue.id} to form input ID ${formInput.id}`);
      formInput.value = formValue.value;
      return;
    }
    
    formValues.forEach((formValue) => {
      const itemId = formValue.id;
      const value = formValue.value;
      
      console.log(`Trying to update item ID: ${itemId} with value: ${value}`);
      let itemFound = false;
      
      this.traverseFormItems(this.editorItems, (item) => {
        if (item.id === itemId) {
          item.value = value;
          itemFound = true;
          console.log(`Updated item ${itemId} with value:`, value);
        }
      });
      
      if (!itemFound) {
        console.warn(`Item with ID ${itemId} not found in editor items. Trying alternative matching...`);
        
        if (formValue.formInputs && formValue.formInputs.length > 0) {
          const formInputId = formValue.formInputs[0].id;
          this.traverseFormItems(this.editorItems, (item) => {
            if (item.id === formInputId) {
              item.value = value;
              console.log(`Matched using formInputs. Updated item ${formInputId} with value:`, value);
              itemFound = true;
            }
          });
        }
      }
      
      if (!itemFound && formInputs.length > 0) {
        console.warn(`Still couldn't find a match for value ID ${itemId}. Consider manually mapping values.`);
      }
    });
    
    this.cdr.detectChanges();
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
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        return {
          ...layout,
          items: layoutInputs.map(input => ({
            id: input.id, 
            type: input.type,
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
    
    console.log('Updated editor items:', this.editorItems);
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

  handleCheckboxChange(itemId: number, selectedLabels: string[]) {
    console.log(`Checkbox change for item ${itemId}:`, selectedLabels);
    
    this.formValues.set(itemId, selectedLabels);
    
    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id === itemId) {
        item.value = selectedLabels; 
      }
    });
    
    this.showValidationErrors = false;
    this.successMessage = '';
    this.errorMessage = '';
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

  collectFormValues(): FormValueRequest[] {
    const formValues: FormValueRequest[] = [];

    this.traverseFormItems(this.editorItems, (item) => {
      if (item.id && item.value !== undefined) {
        console.log(`Collecting value for item ${item.id} (${item.type}):`, item.value);
        
        let singleValue = null;
        let multipleValues: string[] = [];
        
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
      } else {
        callback(item);
      }
    });
  }

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }
    
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    this.isSubmitting = true;
    const formValues = this.collectFormValues();
    
    console.log('Submitting updated form values:', formValues);
    
    this.formSubmissionService.updateFormSubmission(this.userId, this.submissionId, formValues)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error updating form submission:', error);
          this.errorMessage = 'Une erreur est survenue lors de la mise à jour du formulaire. Veuillez réessayer.';
          this.isSubmitting = false;
          window.scrollTo(0, 0);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Form submission updated successfully:', response);
          this.isSubmitting = false;
          this.successMessage = 'Le formulaire a été mis à jour avec succès.';
          window.scrollTo(0, 0);
        },
    
      });
  }
}