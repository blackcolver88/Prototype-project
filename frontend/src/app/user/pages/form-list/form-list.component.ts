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

showFormResponses(formId: number) {
  this.formSubmissionService.getFormSubmissionById(formId).subscribe(
    (submission: any) => {
      const dialogData = {
        ...submission,
        userId: this.userId,  
        formId: formId    
      };
      
      const dialogRef = this.dialog.open(FormResponsesComponent, {
        width: '400px',
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
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
