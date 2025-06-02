import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreateRequestDialogComponent } from '../../components/create-request-dialog/create-request-dialog.component';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { TokenService } from '../../../services/token.service';
import { FormResponsesComponent } from '../form-responses/form-responses.component';

interface RequestData {
  id: number;
  formTitle: string;
  targetRole: string;
  status: string;
  dateCreated: string;
  formId: number;
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  requests: RequestData[] = [];
  displayData: RequestData[] = [];
  isBrowser: boolean;
  Math = Math; // Make Math available in template

  // Pagination properties
  currentPage = 0;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private formSubmissionService: FormSubmissionService,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.formSubmissionService.getUserFormSubmissions(userId).subscribe({
        next: (submissions) => {
          this.requests = submissions.map(submission => ({
            id: submission.id,
            formTitle: submission.formTitle || 'Unknown Form',
            targetRole: submission.targetRole || 'ROLE_ADMIN', // Use the actual target role from submission
            status: 'Pending', // This would come from workflow status
            dateCreated: submission.date ? new Date(submission.date).toLocaleDateString() : 'Unknown',
            formId: submission.idForm
          }));
          this.totalItems = this.requests.length;
          this.updatePagination();
        },
        error: (error) => {
          console.error('Error loading requests:', error);
        }
      });
    }
  }

  createNewRequest() {
    const dialogRef = this.dialog.open(CreateRequestDialogComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Navigate to form filling page with selected form and role
        this.router.navigate(['/formvalue', result.formId], {
          queryParams: { targetRole: result.targetRole }
        });
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayData = this.requests.slice(startIndex, endIndex);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.updatePagination();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewRequest(request: RequestData) {
    const userId = this.tokenService.getUserId();
    if (!userId) return;

    // Get the specific submission by ID
    this.formSubmissionService.getFormSubmissionById(request.id).subscribe(
      (submission: any) => {
        // Get the form ID from the submission
        const formId = submission.idForm;
        
        // Get the properly formatted form values for this specific submission
        this.formSubmissionService.getFormSubmissionsByUserAndForm(userId, formId).subscribe(
          (allSubmissionsForForm: any[]) => {
            // Find only the specific submission we clicked on
            const targetSubmission = allSubmissionsForForm.find(s => s.id === request.id);
            
            if (!targetSubmission) {
              console.error('Could not find submission with ID:', request.id);
              return;
            }
            
            // Pass only this specific submission to the dialog
            const dialogData = {
              userId: userId,
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

  editRequest(request: RequestData) {
    // Navigate to edit request
    this.router.navigate(['/edit', this.tokenService.getUserId(), request.id]);
  }

  deleteRequest(request: RequestData) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.formSubmissionService.deleteFormSubmission(request.id).subscribe({
        next: () => {
          this.loadRequests();
        },
        error: (error) => {
          console.error('Error deleting request:', error);
        }
      });
    }
  }
}
