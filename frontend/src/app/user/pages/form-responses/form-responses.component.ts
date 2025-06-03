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
    // Extract data from dialog data
    this.userId = this.data.userId;
    this.formId = this.data.formId;
    
    if (this.data.specificSubmission) {
      console.log('Using specific submission:', this.data.specificSubmission);
      // Process and ensure form values have proper titles
      const processedSubmission = {
        ...this.data.specificSubmission,
        formValues: (this.data.specificSubmission.formValues || []).map((value: any) => ({
          title: value.title || value.input?.label || value.formInput?.title || 'Field',
          value: value.value || ''
        }))
      };
      console.log('Processed form values:', processedSubmission.formValues);
      this.submissions = [processedSubmission];
      this.loading = false;
    } else if (this.data.submissionId) {
      // If we have only a submission ID, fetch the details
      console.log('Fetching submission by ID:', this.data.submissionId);
      this.loading = true;
      this.formSubmissionService.getFormSubmissionById(this.data.submissionId).subscribe({
        next: (submission) => {
          if (submission) {
            this.submissions = [submission];
          } else {
            this.submissions = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching submission by ID:', error);
          this.submissions = [];
          this.loading = false;
        }
      });
    } else {
      // Fallback to loading all submissions (preserving existing behavior)
      if (!this.userId || !this.formId) {
        console.error('Missing userId or formId in dialog data', this.data);
        return;
      }
      this.loadFormSubmissions();
    }
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