
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormSubmission } from '../../../model/FormSubmission';
import { CommonModule } from '@angular/common';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-form-responses',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  providers: [FormSubmissionService, DatePipe],
  templateUrl: './form-responses.component.html',
  styleUrls: ['./form-responses.component.css']
})

export class FormResponsesComponent implements OnInit {
  userId!: number;
  formId!: number;
  submissions: FormSubmission[] = [];
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<FormResponsesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formSubmissionService: FormSubmissionService
  ) {
    this.userId = data.userId;
    this.formId = data.formId;
  }

ngOnInit() {
  if (!this.userId || !this.formId) {
    console.error('Missing userId or formId in dialog data', this.data);
    this.userId = this.data.userId ;
    this.formId = this.data.id || this.data.formId; 
  }
  
  this.loadFormSubmissions();
}

loadFormSubmissions() {
  this.loading = true;

  console.log('Loading submissions for:', this.userId, this.formId);

  this.formSubmissionService.getFormSubmissionsByUserAndForm(this.userId, this.formId).subscribe({
    next: (data) => {
      this.submissions = Array.isArray(data)
        ? data.map(submission => ({
            ...submission,
            formValues: Array.isArray(submission.formValues)
              ? submission.formValues
              : []
          }))
        : [];

      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching form submissions:', error);
      this.submissions = [];
      this.loading = false;
    }
  });
}
  closeDialog(): void {
    this.dialogRef.close();
  }
}