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


@Component({
  selector: 'app-formvalue',
 imports: [ CommonModule, CdkTreeModule, DialogModule,
    HttpClientModule, FontAwesomeModule,
    TextformComponent, EmailComponent, CheckboxComponent, PhoneNumberComponent,
    RadioButtonComponent, SelectBoxComponent, DatepickerComponent, ButtonComponent, BasicDatepickerComponent, TextAreaComponent, PasswordComponent],  
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
        },
        error: (error) => {
          console.error('Error loading form template with layouts and inputs:', error);
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
    const multiChoiceInputs = inputs.filter(input =>
      input.type === 'CHECKBOX' ||
      input.type === 'SELECT_BOX' ||
      input.type === 'RADIO_BUTTON'
    );
  
    if (multiChoiceInputs.length === 0) {
      return;
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
        });
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

  submitForm() {
    if (this.isFormSubmitted) {
      alert('You have already submitted this form.');
      console.warn('You have already submitted this form.');
      return;
    }
    if (!this.validateForm()) {
      return; 
    }
    const formValues = this.collectFormValues();
    this.formSubmissionService
      .submitForm(this.userId, +this.templateId, formValues)
      .subscribe({
        next: (result) => {
          this.isFormSubmitted = true; 
          this.router.navigate(['/forms']); 
        },
        error: (error) => {
          console.error('Erreur lors de la soumission du formulaire :', error);
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