import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../services/form-submission.service';
import { MatDialog } from '@angular/material/dialog';
import { FormResponsesComponent } from '../../user/pages/form-responses/form-responses.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-submission',
  standalone: true,
  imports: [
    NgxPaginationModule,
    CommonModule,
  ],
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
    this.formSubmissionService.getAdminFormSubmissions(this.currentPage - 1, this.itemsPerPage).subscribe(
      (response: any) => {
        this.submissions = response.data;
        this.totalItems = response.totalItems;
      },
      (error) => {
        console.error('Error fetching submissions:', error);
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
        const dialogRef = this.dialog.open(FormResponsesComponent, {
          width: '400px',
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Dialog Closed');
        });
      },
      (error) => {
        console.error('Error fetching submission:', error);
      }
    );
  }

  goPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSubmissions();
    }
  }

  goNextPage() {
    if (!this.isLastPage()) {
      this.currentPage++;
      this.loadSubmissions();
    }
  }

  isLastPage(): boolean {
    return this.currentPage >= Math.ceil(this.totalItems / this.itemsPerPage);
  }
}