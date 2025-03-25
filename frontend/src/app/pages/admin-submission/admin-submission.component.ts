import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../services/form-submission.service';
import { MatDialog } from '@angular/material/dialog';
import { FormResponsesComponent } from '../../user/pages/form-responses/form-responses.component';
import { NgxPaginationModule, PaginationControlsComponent } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-submission',
  standalone: true,
  imports: [
    NgxPaginationModule, 
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-submission.component.html',
  styleUrls: ['./admin-submission.component.css']
})
export class AdminSubmissionComponent implements OnInit {
  submissions: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  constructor(
    private formSubmissionService: FormSubmissionService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.formSubmissionService.getAdminFormSubmissions(this.currentPage, this.itemsPerPage).subscribe(
      (response: any) => {
        console.log('Réponse reçue :', response);
        this.submissions = response.data;
        this.totalItems = response.totalItems;
        console.log('Données mises à jour :', this.submissions, this.totalItems);
      },
      (error) => {
        console.error('Erreur lors de la récupération des soumissions :', error);
      }
    );
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadSubmissions();
  }

  showFormResponses(submissionId: number) {
    this.formSubmissionService.getFormSubmissionById(submissionId).subscribe(
      (submission: any) => {
        const dialogData = {
          userId: submission.user.id, 
          formId: submission.idForm, 
          ...submission
        };
        console.log('Données transmises à la boîte de dialogue :', dialogData);
  
        const dialogRef = this.dialog.open(FormResponsesComponent, {
          width: '400px',
          data: dialogData
        });
  
        dialogRef.afterClosed().subscribe(result => {
          console.log('La boîte de dialogue a été fermée');
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération de la soumission :', error);
      }
    );
  }


}