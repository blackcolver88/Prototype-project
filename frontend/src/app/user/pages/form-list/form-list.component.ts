import { Component, OnInit } from '@angular/core';
import { FormSubmissionService } from '../../../services/form-submission.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormResponsesComponent } from '../form-responses/form-responses.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TokenService } from '../../../services/token.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css'],
  imports: [CommonModule, AgGridModule]
})
export class FormListComponent implements OnInit {
  forms: any[] = [];
  userId = 1; 
  formId!: number;
  isBrowser: boolean;
  
  colDefs: ColDef[] = [
    { 
      field: 'formTitle', 
      headerName: 'Titre du formulaire', 
      sortable: true, 
      flex: 2
    },
    { 
      field: 'date', 
      headerName: 'Date de création', 
      sortable: true,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A',
      flex: 1.5
    },
    {
      headerName: '',
      field: 'id',
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const container = document.createElement('div');
        container.className = 'flex items-center justify-center space-x-2';
        
        const displayBtn = document.createElement('button');
        displayBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>';
        displayBtn.className = 'p-1.5 rounded-full hover:bg-blue-100 transition-colors';
        displayBtn.title = 'Afficher les détails';
        displayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showFormResponses(params.value);
        });
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>';
        editBtn.className = 'p-1.5 rounded-full hover:bg-green-100 transition-colors';
        editBtn.title = 'Modifier le formulaire';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onEditClick(params.value);
        });
        
        container.appendChild(displayBtn);
        container.appendChild(editBtn);
        return container;
      }
    }
  ];
  
  public gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      flex: 1,
      minWidth: 150,
      autoHeight: true
    },
    pagination: false,
    suppressPaginationPanel: true,
    domLayout: 'autoHeight',
    suppressCellFocus: true,
    suppressColumnVirtualisation: false,
    enableCellTextSelection: true
  };

  constructor(
    private formSubmissionService: FormSubmissionService,
    private router: Router,
    private dialog: MatDialog,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

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
              width: '800px',
              maxWidth: '90vw',
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
