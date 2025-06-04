import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../services/form-submission.service';
import { TokenService } from '../../services/token.service';
import { MatDialog } from '@angular/material/dialog';
import { FormResponsesComponent } from '../../user/pages/form-responses/form-responses.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [
    NgxPaginationModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit {
  submissions: any[] = [];
  tasks: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 15, 20];
  userRole: string | null = null;

  constructor(
    private formSubmissionService: FormSubmissionService,
    private tokenService: TokenService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Get the user's role from the token
    this.userRole = this.tokenService.getUserRole();
    this.loadSubmissions();
    this.loadTasksForRole();
  }

  loadSubmissions() {
    if (!this.userRole) {
      console.error('User role not found. Cannot load role-specific submissions.');
      // Fallback to admin submissions if role is not available
      this.formSubmissionService.getAdminFormSubmissions(this.currentPage - 1, this.itemsPerPage).subscribe(
        (response: any) => {
          this.submissions = response.data;
          this.totalItems = response.totalItems;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        },
        (error) => {
          console.error('Error fetching fallback admin submissions:', error);
        }
      );
      return;
    }

    this.formSubmissionService.getFormSubmissionsByTargetRole(this.userRole, this.currentPage - 1, this.itemsPerPage).subscribe(
      (response: any) => {
        this.submissions = response.data;
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      (error) => {
        console.error('Error fetching submissions for role:', this.userRole, error);
        // Fallback to admin submissions if role-based filtering fails
        console.log('Falling back to admin submissions...');
        this.formSubmissionService.getAdminFormSubmissions(this.currentPage - 1, this.itemsPerPage).subscribe(
          (response: any) => {
            this.submissions = response.data;
            this.totalItems = response.totalItems;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          },
          (fallbackError) => {
            console.error('Error fetching fallback submissions:', fallbackError);
          }
        );
      }
    );
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadSubmissions();
    this.loadTasksForRole();
  }

  showFormResponses(submissionId: number) {
    this.formSubmissionService.getFormSubmissionById(submissionId).subscribe(
      (submission: any) => {
        // Check if we have a valid user ID
        if (!submission.user?.id) {
          console.log('No user ID found for submission, using direct approach');
          // Try to fetch the form template to map titles
          this.formSubmissionService.getFormTemplateBySubmissionId(submissionId).subscribe(
            (formTemplate: any) => {
              // Build a map of inputId to title
              const inputTitleMap: { [key: number]: string } = {};
              if (formTemplate.formLayouts) {
                formTemplate.formLayouts.forEach((layout: any) => {
                  if (layout.formInputs) {
                    layout.formInputs.forEach((input: any) => {
                      inputTitleMap[input.id] = input.title;
                    });
                  }
                });
              }
              // Map formValues to {title, value}
              const mappedValues = (submission.formValues || []).map((fv: any) => ({
                title: inputTitleMap[fv.formInputs?.[0]?.id] || '',
                value: fv.value
              }));
              const fallbackDialogData = {
                submissionId: submissionId,
                formId: submission.idForm,
                specificSubmission: {
                  ...submission,
                  formValues: mappedValues
                }
              };
              this.dialog.open(FormResponsesComponent, {
                width: '400px',
                data: fallbackDialogData
              });
            },
            (error) => {
              // If even this fails, just show the raw data
              const fallbackDialogData = {
                submissionId: submissionId,
                formId: submission.idForm,
                specificSubmission: submission
              };
              this.dialog.open(FormResponsesComponent, {
                width: '400px',
                data: fallbackDialogData
              });
            }
          );
          return;
        }
        
        const userId = submission.user.id;
        const formId = submission.idForm;
        
        // Get the properly formatted form values for this specific submission
        this.formSubmissionService.getFormSubmissionsByUserAndForm(userId, formId).subscribe(
          (allSubmissionsForForm: any[]) => {
            // Find only the specific submission we clicked on
            const targetSubmission = allSubmissionsForForm.find(s => s.id === submissionId);
            
            if (!targetSubmission) {
              console.error('Could not find submission with ID:', submissionId);
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
              data: dialogData
            });
          },
          (error) => {
            console.error('Error fetching form submissions:', error);
            // Fallback to display basic submission data on error, with mapped titles if possible
            this.formSubmissionService.getFormTemplateBySubmissionId(submissionId).subscribe(
              (formTemplate: any) => {
                const inputTitleMap: { [key: number]: string } = {};
                if (formTemplate.formLayouts) {
                  formTemplate.formLayouts.forEach((layout: any) => {
                    if (layout.formInputs) {
                      layout.formInputs.forEach((input: any) => {
                        inputTitleMap[input.id] = input.title;
                      });
                    }
                  });
                }
                const mappedValues = (submission.formValues || []).map((fv: any) => ({
                  title: inputTitleMap[fv.formInputs?.[0]?.id] || '',
                  value: fv.value
                }));
                const fallbackDialogData = {
                  submissionId: submissionId,
                  formId: submission.idForm,
                  specificSubmission: {
                    ...submission,
                    formValues: mappedValues
                  }
                };
                this.dialog.open(FormResponsesComponent, {
                  width: '400px',
                  data: fallbackDialogData
                });
              },
              (error) => {
                const fallbackDialogData = {
                  submissionId: submissionId,
                  formId: submission.idForm,
                  specificSubmission: submission
                };
                this.dialog.open(FormResponsesComponent, {
                  width: '400px',
                  data: fallbackDialogData
                });
              }
            );
          }
        );
      },
      (error) => {
        console.error('Error fetching submission:', error);
      }
    );
  }

  validateRequest(submissionId: number) {
    // Find the corresponding task for this submission
    const relatedTask = this.tasks.find(task => 
      task.formSubmissionId === submissionId
    );

    if (!relatedTask) {
      console.error('No task found for submission:', submissionId);
      alert('No active task found for this submission.');
      return;
    }

    const userId = this.tokenService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      alert('User authentication error. Please log in again.');
      return;
    }

    // Complete the task using the workflow service
    this.formSubmissionService.completeTask(relatedTask.id, userId).subscribe(
      (response) => {
        console.log('Task completed successfully:', response);
        alert('Request validated successfully!');
        // Reload the data to reflect changes
        this.loadSubmissions();
        this.loadTasksForRole();
      },
      (error) => {
        console.error('Error completing task:', error);
        alert('Failed to validate request. Please try again.');
      }
    );
  }

  loadTasksForRole() {
    if (!this.userRole) {
      console.log('No user role available, skipping task loading');
      return;
    }

    this.formSubmissionService.getTasksByRole(this.userRole).subscribe(
      (tasks) => {
        this.tasks = tasks;
        console.log('Loaded tasks for role:', this.userRole, tasks);
      },
      (error) => {
        console.error('Error loading tasks for role:', this.userRole, error);
        this.tasks = [];
      }
    );
  }

  rejectRequest(submissionId: number) {
    // TODO: Implement rejection logic
    console.log('Rejecting request:', submissionId);
  }

  onPageSizeChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    this.loadSubmissions();
    this.loadTasksForRole();
  }
} 