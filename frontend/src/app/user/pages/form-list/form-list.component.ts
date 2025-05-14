import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormResponsesComponent } from '../form-responses/form-responses.component';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css'],
    imports: [CommonModule]
})
export class FormListComponent implements OnInit {
  forms: any[] = [];
  userId = 1; 
  formId!: number;

  constructor(
    private formSubmissionService: FormSubmissionService,
    private router: Router,
    private dialog: MatDialog,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.userId = this.tokenService.getUserId() || 1;

    this.formSubmissionService.getUserFormSubmissions().subscribe(
      (data) => {
        this.forms = data.map((submission: any) => ({
          id: submission.id,
          task: submission.task || 'Tâche inconnue',
          formTitle: submission.formTitle || 'Formulaire inconnu',
          date: submission.date || 'Date inconnue',
        }));
      },
      (error) => {
        console.error('Erreur lors de la récupération des formulaires :', error);
      }
    );
  }

  showFormResponses(submissionId: number) {
    // First, get the specific submission by ID
    this.formSubmissionService.getFormSubmissionById(submissionId).subscribe(
      (submission: any) => {
        // Get the form ID from the submission
        const formId = submission.idForm;
        
        // Get the properly formatted form values for this specific submission
        this.formSubmissionService.getFormSubmissionsByUserAndForm(this.userId, formId).subscribe(
          (allSubmissionsForForm: any[]) => {
            // Find only the specific submission we clicked on
            const targetSubmission = allSubmissionsForForm.find(s => s.id === submissionId);
            
            if (!targetSubmission) {
              console.error('Could not find submission with ID:', submissionId);
              return;
            }
            
            // Pass only this specific submission to the dialog
            const dialogData = {
              userId: this.userId,
              formId: formId,
              specificSubmission: targetSubmission
            };
            
            const dialogRef = this.dialog.open(FormResponsesComponent, {
              width: '400px',
              data: dialogData,
            });
          },
          (error) => {
            console.error('Error fetching form submissions:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching form submission:', error);
      }
    );
  }

  onEditClick(formId: number | undefined) {
    if (formId) {
      this.router.navigate(['/edit', this.userId, formId]);
    } else {
      console.error('ID du formulaire non défini');
    }
  }
}
