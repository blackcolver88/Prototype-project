import { ChangeDetectorRef, Component } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { FormTemplateService } from '../../../services/form-template.service';
import { MultipleValueService } from '../../../services/multiple-value.service';
import { catchError, forkJoin, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { FormInput } from '../../../model/FormInput';
import { MultipleValue } from '../../../model/MultipleValue';


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
  formTitle: string = '';
    private destroy$ = new Subject<void>();
    templateId!: string;
    editorItems: any[] = [];


    constructor(private route: ActivatedRoute,
      private router: Router,private matDialog: MatDialog,private formTemplateService: FormTemplateService,
      private cdr: ChangeDetectorRef, private multipleValueService: MultipleValueService) {
    }

    
  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.templateId = params.get('id')!;
      this.loadFormTemplateWithLayouts(this.templateId);


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


}
