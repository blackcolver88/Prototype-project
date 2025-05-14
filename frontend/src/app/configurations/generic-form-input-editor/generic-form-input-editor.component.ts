import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormInputType } from '../../model/FormInputType';
import { FormInputService } from '../../services/form-input.service';
import { FormInput } from '../../model/FormInput';
import { MultipleValue } from '../../model/MultipleValue';

@Component({
  selector: 'app-generic-form-input-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generic-form-input-editor.component.html',
  styleUrls: ['./generic-form-input-editor.component.css'],
  providers: [FormInputService]
})
export class GenericFormInputEditorComponent implements OnInit {
  formInputForm: FormGroup;
  inputType: string;
  formInputTypes = Object.values(FormInputType);
  isEditing = false;
  formInputId: number | null = null;
  
  commonFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{value: string, label: string}>;
  }> = [
    { name: 'label', label: 'Label', type: 'text', required: true },
    { name: 'isRequired', label: 'Required', type: 'checkbox', required: false }
  ];

  specificFields: { [key: string]: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{value: string, label: string}>;
    rows?: number;
  }> } = {
    'TEXTFIELD': [
      { name: 'type', label: 'Input Type', type: 'select', required: true, options: [
        { value: 'text', label: 'Text' },
        { value: 'email', label: 'Email' },
        { value: 'number', label: 'Number' },
        { value: 'password', label: 'Password' }
      ]}
    ],
    'TEXTAREA': [
      { name: 'rows', label: 'Rows', type: 'number', required: false }
    ],
    'CHECKBOX': [
      { name: 'options', label: 'Options', type: 'options', required: true }
    ],
    'RADIO_BUTTON': [
      { name: 'options', label: 'Options', type: 'options', required: true }
    ],
    'SELECT_BOX': [
      { name: 'optionsString', label: 'Options (comma-separated)', type: 'text', required: true }
    ],
    'EMAIL': [],
    'PHONE_NUMBER': []
  };

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
    private formInputService: FormInputService
  ) {
    if (data?.item) {
      this.inputType = data.item.type;
      console.log('Type détecté en mode édition:', this.inputType);
    } else if (data?.type) {
      this.inputType = data.type;
      console.log('Type détecté en mode création:', this.inputType);
    } else {
      this.inputType = 'TEXTFIELD';
      console.log('Type par défaut utilisé:', this.inputType);
    }
    
    this.formInputForm = this.createFormGroup();
  }

  ngOnInit(): void {
    this.formInputForm = this.fb.group({
      label: ['', Validators.required],
      isRequired: [false]
    });
    
    this.addSpecificFieldsToForm(this.inputType);
    
    if (this.data?.item) {
      this.isEditing = true;
      this.formInputId = this.data.item.id || null;
      this.patchFormValues();
    }
  }

  private createFormGroup(): FormGroup {
    const formGroup = this.fb.group({});
    
    this.commonFields.forEach(field => {
      if (field.name === 'options') {
        formGroup.addControl(field.name, this.fb.array([]));
      } else {
        const validators = field.required ? [Validators.required] : [];
        formGroup.addControl(field.name, this.fb.control('', validators));
      }
    });
    
    const specificFields = this.specificFields[this.inputType] || [];
    specificFields.forEach(field => {
      if (field.name === 'options') {
        formGroup.addControl(field.name, this.fb.array([]));
      } else {
        const validators = field.required ? [Validators.required] : [];
        formGroup.addControl(field.name, this.fb.control('', validators));
      }
    });
    
    return formGroup;
  }

  private addSpecificFieldsToForm(inputType: string): void {
    const specificFields = this.specificFields[inputType] || [];
    
    specificFields.forEach(field => {
      if (field.name === 'options') {
        this.formInputForm.addControl(field.name, this.fb.array([]));
      } else {
        const validators = field.required ? [Validators.required] : [];
        this.formInputForm.addControl(field.name, this.fb.control('', validators));
      }
    });
  }

  private patchFormValues(): void {
    if (!this.data.item) return;

    let config: any = {};
    try {
      if (typeof this.data.item.config === 'string') {
        config = JSON.parse(this.data.item.config);
      } else {
        config = this.data.item.config || {};
      }
    } catch (e) {
      console.error('Erreur lors du parsing de la configuration:', e);
      config = {};
    }

    this.formInputForm.patchValue({
      label: this.data.item.title || config.label || '',
      isRequired: this.data.item.required || config.required || config.isRequired || false
    });

    switch (this.inputType) {
      case 'TEXTFIELD':
        this.formInputForm.patchValue({ type: config.type || 'text' });
        break;

      case 'TEXTAREA':
        this.formInputForm.patchValue({ rows: config.rows || 3 });
        break;

      case 'SELECT_BOX':
        if (config.options && Array.isArray(config.options)) {
          const optionsString = config.options
            .map((opt: any) => typeof opt === 'string' ? opt : (opt.label || opt.value || ''))
            .filter((opt: string) => opt.trim() !== '')
            .join(', ');
          this.formInputForm.patchValue({ optionsString });
        }
        break;

      case 'CHECKBOX':
      case 'RADIO_BUTTON':
        while (this.options.length !== 0) {
          this.options.removeAt(0);
        }

        const uniqueOptions = new Map<string, any>();

        if (config.options && Array.isArray(config.options)) {
          config.options.forEach((option: any) => {
            const label = typeof option === 'string' ? option : (option.label || '');
            if (label.trim() && !uniqueOptions.has(label)) {
              uniqueOptions.set(label, {
                label,
                value: typeof option === 'string' ? option : (option.value || label)
              });
            }
          });
        }

        if (this.data.item.multipleValues && Array.isArray(this.data.item.multipleValues)) {
          this.data.item.multipleValues.forEach((mv: any) => {
            if (mv.valeurs && Array.isArray(mv.valeurs)) {
              mv.valeurs.forEach((val: string) => {
                try {
                  let option: any;
                  if (typeof val === 'string' && val.startsWith('{')) {
                    option = JSON.parse(val);
                  } else {
                    option = { label: val, value: val };
                  }
                  
                  if (!uniqueOptions.has(option.label)) {
                    uniqueOptions.set(option.label, option);
                  }
                } catch (e) {
                  console.error('Erreur lors du parsing de la valeur:', val, e);
                }
              });
            }
          });
        }

        Array.from(uniqueOptions.values()).forEach(option => {
          this.addOption(option);
        });
        break;
    }
  }

  get options(): FormArray {
    return this.formInputForm.get('options') as FormArray;
  }

  addOption(option: any = { label: '', value: '' }): void {
    const value = option.value || this.generateValueFromLabel(option.label || '');
    
    const optionGroup = this.fb.group({
      label: [option.label || '', Validators.required],
      value: [value],
      checked: [option.checked || false]
    });
    
    optionGroup.get('label')?.valueChanges.subscribe(newLabel => {
      optionGroup.get('value')?.setValue(this.generateValueFromLabel(newLabel));
    });
    
    this.options.push(optionGroup);
  }
  
  private generateValueFromLabel(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '_');
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

save(): void {
    if (this.formInputForm.valid) {
      const formData = this.formInputForm.value;
      
      console.log('Données du formulaire à sauvegarder:', formData);
      console.log('Type de composant:', this.inputType);
      
      const configObj: any = {
        label: formData.label,
        required: formData.isRequired
      };
      
      let optionsArray: Array<{label: string; value: string}> = [];
      let multipleValuesArray: MultipleValue[] = [];
      
      switch (this.inputType) {
     case 'SELECT_BOX':
  if (formData.optionsString) {
    const rawOptions = formData.optionsString
      .split(',')
      .map((opt: string) => opt.trim())
      .filter((opt: string) => opt !== '');
    optionsArray = rawOptions.map((opt: string) => ({
      label: opt,
      value: this.generateValueFromLabel(opt)
    }));
    multipleValuesArray = optionsArray.map((opt: {label: string; value: string}) => ({
      valeurs: [JSON.stringify(opt)]
    }));
    configObj.options = optionsArray;
  }
  break;
          if (formData.optionsString) {
            const rawOptions = formData.optionsString
              .split(',')
              .map((opt: string) => opt.trim())
              .filter((opt: string) => opt !== '');
            optionsArray = rawOptions.map((opt: string) => ({
              label: opt,
              value: this.generateValueFromLabel(opt)
            }));
            multipleValuesArray = optionsArray.map((opt: {label: string; value: string}) => ({
              valeurs: [JSON.stringify(opt)]
            }));
            
            configObj.options = optionsArray;
          }
          break;
          
        case 'RADIO_BUTTON':
        case 'CHECKBOX':
          if (this.options.controls.length > 0) {
            optionsArray = this.options.controls.map(control => control.value);
            
            configObj.options = optionsArray.map(opt => ({
              label: opt.label,
              value: opt.value || this.generateValueFromLabel(opt.label)
            }));
            
            multipleValuesArray = optionsArray.map(opt => ({
              valeurs: [JSON.stringify({label: opt.label, value: opt.value})]
            }));
          }
          break;
      }
      
      const configuredItem: FormInput = {
        type: this.inputType,
        title: formData.label,
        name: formData.label.toLowerCase().replace(/\s+/g, '_'),
        required: formData.isRequired,
        config: JSON.stringify(configObj)
      } as unknown as FormInput;
      
      if (this.inputType === 'SELECT_BOX' || this.inputType === 'RADIO_BUTTON' || this.inputType === 'CHECKBOX') {
        configuredItem.multipleValues = multipleValuesArray;
      }
      
      console.log('Objet configuré final:', configuredItem);
      
      if (this.isEditing && this.formInputId) {
        configuredItem.id = this.formInputId;
        
        if (this.data.item) {
          if (this.data.item.formLayout) {
            configuredItem.formLayout = this.data.item.formLayout;
          }
          
          if (this.data.item.ordinalPosition !== undefined) {
            configuredItem.ordinalPosition = this.data.item.ordinalPosition;
          }
          
          if (this.data.item.formValue) {
            configuredItem.formValue = this.data.item.formValue;
          }
        }
        
        if (typeof this.formInputId === 'number') {
          console.log('Envoi de la mise à jour au serveur:', configuredItem);
          
          this.formInputService.updateFormInput(this.formInputId, configuredItem)
            .subscribe({
              next: (updatedInput) => {
                console.log('FormInput mis à jour avec succès:', updatedInput);
                this.dialogRef.close({
                  ...configuredItem,
                  id: this.formInputId,
                  config: configuredItem.config ? JSON.parse(configuredItem.config) : {},
                  multipleValues: configuredItem.multipleValues
                });
              },
              error: (error) => {
                console.error('Erreur lors de la mise à jour du FormInput:', error);
                this.dialogRef.close(this.data.item);
              }
            });
        } else {
          console.error('formInputId n\'est pas un nombre valide:', this.formInputId);
          this.dialogRef.close(this.data.item);
        }
      } else {
        this.dialogRef.close(configuredItem);
      }
    } else {
      this.formInputForm.markAllAsTouched();
    }
  }


  cancel(): void {
    this.dialogRef.close();
  }

  getFieldsByType(type: string): any[] {
    return this.specificFields[type] || [];
  }

  hasField(fieldName: string): boolean {
    return this.formInputForm.get(fieldName) !== null;
  }

  getFieldType(fieldName: string): string {
    const commonField = this.commonFields.find(f => f.name === fieldName);
    if (commonField) return commonField.type;
    
    const specificFields = this.specificFields[this.inputType] || [];
    const specificField = specificFields.find(f => f.name === fieldName);
    return specificField ? specificField.type : 'text';
  }

  getFieldOptions(fieldName: string): any[] {
    const commonField = this.commonFields.find(f => f.name === fieldName);
    if (commonField && commonField.options) return commonField.options;
    
    const specificFields = this.specificFields[this.inputType] || [];
    const specificField = specificFields.find(f => f.name === fieldName);
    return specificField && specificField.options ? specificField.options : [];
  }
}