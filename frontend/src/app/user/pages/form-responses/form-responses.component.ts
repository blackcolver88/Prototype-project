import { Component, OnInit } from '@angular/core';
import { FormSubmission } from '../../../model/FormSubmission';
import { ActivatedRoute } from '@angular/router';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-responses',
  imports: [CommonModule],
  templateUrl: './form-responses.component.html',
  styleUrl: './form-responses.component.css'
})

export class FormResponsesComponent implements OnInit {
  userId!: number;
  formId!: number;
  submissions: FormSubmission[] = []; 
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formSubmissionService: FormSubmissionService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = +params['userId'];
      this.formId = +params['formId'];
      this.loadFormSubmissions();
    });
  }

  loadFormSubmissions() {
    this.loading = true;
    this.formSubmissionService.getFormSubmissionsByUserAndForm(this.userId, this.formId).subscribe({
      next: (data) => {
        this.submissions = data || []; 
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching form submissions:', error);
        this.submissions = []; 
        this.loading = false;
      }
    });
  }
}

