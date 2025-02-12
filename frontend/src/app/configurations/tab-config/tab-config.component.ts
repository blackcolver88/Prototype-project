import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {FormLayout} from '../../model/FormLayout';
import {FormLayoutType} from '../../model/FormLayoutType';
import {HttpClientModule} from '@angular/common/http';
import {DialogRef} from "@angular/cdk/dialog";
import { StepperComponent } from '../../components/stepper/stepper.component';
import { FormLayoutService } from '../../services/form-layout.service';
@Component({
  selector: 'app-tab-config',
  imports: [ReactiveFormsModule, CommonModule, StepperComponent, CdkStepperModule, HttpClientModule],
  templateUrl: './tab-config.component.html',
  styleUrl: './tab-config.component.css',

})
export class TabConfigComponent implements OnInit {
  tabForm: FormGroup;
  @Output() saveStepper = new EventEmitter<any>();
  private dialogRef = inject(DialogRef);
  customizedStepperData: any;

  formLayout: FormLayout= {
    id: 0,
    title: '',
    formInputs:[],
    type: FormLayoutType.STEPPER,
    priority:0,
    style:'',
    children:[]
  };

  constructor(private formLayoutService: FormLayoutService,private fb: FormBuilder) {
    this.tabForm = this.fb.group({
      label: [''],
      tabs: this.fb.array([]),
      customCssClass: [''],
      hidden: [false],
      verticalLayout: [false],
      hideLabel: [false],
      modalEdit: [false],
    });
  }

  ngOnInit(): void {
    this.addTab();
  }

  get tabs(): FormArray {
    return this.tabForm.get('tabs') as FormArray;
  }


  addTab(): void {
    const tabGroup = this.fb.group({
      label: [''],
      key: ['']
    });
    this.tabs.push(tabGroup);
  }

  removeTab(index: number): void {
    this.tabs.removeAt(index);
  }

  onSave(): void {
    this.customizedStepperData = {
      type: 'stepper',
      label: this.tabForm.value.label,
      tabs: this.tabForm.value.tabs,
      customCssClass: this.tabForm.value.customCssClass,
      hidden: this.tabForm.value.hidden,
      verticalLayout: this.tabForm.value.verticalLayout,
      hideLabel: this.tabForm.value.hideLabel,
      modalEdit: this.tabForm.value.modalEdit,
      content: this.tabForm.value.tabs.map((tab: { label: string; }) => tab.label),
    };
    this.saveStepper.emit(this.customizedStepperData);


    this.formLayout = {
      ...this.formLayout,
      title: this.tabForm.value.label || '',
    };

    this.formLayoutService.createFormLayout(this.formLayout).subscribe(
      (response: FormLayout) => {
        console.log('Form Layout saved successfully:', response);
      },
      (error: any) => {
        console.error('Error saving Form Layout:', error);
      }
    );
    const formData = this.tabForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  remove(): void {

  }

}
