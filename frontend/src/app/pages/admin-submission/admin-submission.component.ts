import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../services/form-submission.service';
import { MatDialog } from '@angular/material/dialog';
import { FormResponsesComponent } from '../../user/pages/form-responses/form-responses.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-submission',
  standalone: true,
  imports: [
    NgxPaginationModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './admin-submission.component.html',
  styleUrls: ['./admin-submission.component.css']
})
export class AdminSubmissionComponent implements OnInit {
  submissions: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 15, 20];

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
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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
        const userId = submission.user?.id || null;
        console.log('Submission data:', submission);

        const dialogData = {
          userId: userId,
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
    return this.currentPage >= this.totalPages;
  }

  getMaxItems(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  onPageSizeChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    this.loadSubmissions();
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // If we have fewer pages than the max visible, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 3);

      // Adjust if we're near the end
      if (endPage === this.totalPages - 1) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3));
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < this.totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      pages.push(this.totalPages);
    }

    return pages;
  }
}