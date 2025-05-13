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
  ) {}

  ngOnInit() {
    this.userId = this.data.userId; 
    this.formId = this.data.formId || this.data.idForm; 

    if (!this.userId || !this.formId) {
      console.error('Missing userId or formId in dialog data', this.data);
      return;
    }

    this.loadFormSubmissions();
  }

  loadFormSubmissions() {
    this.loading = true;
    console.log('Loading submissions for:', this.userId, this.formId);

    this.formSubmissionService.getFormSubmissionsByUserAndForm(this.userId, this.formId).subscribe({
      next: (data: any[]) => {
        this.submissions = Array.isArray(data)
          ? data.map((submission: any) => ({
              ...submission,
              formValues: Array.isArray(submission.formValues)
                ? submission.formValues
                : []
            }))
          : [];

        this.loading = false;
      },
      error: (error: Error) => {
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