import { ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgGridAngular } from "ag-grid-angular";
import { ColDef } from 'ag-grid-community';
import { Dialog, DialogModule } from "@angular/cdk/dialog";
import { FormTemplateCreateComponent } from "./components/form-template-create/form-template-create.component";
import { FormTemplate } from "../../model/FormTemplate";
import { Router, RouterModule } from '@angular/router';
import { FormTemplateService } from "../../services/form-template.service";
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-form-template',
  standalone: true,
  imports: [AgGridAngular, CommonModule, DialogModule, RouterModule, FormsModule],
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.css']
})
export class FormTemplateComponent implements OnInit {
  allTemplates: FormTemplate[] = [];
  rowData: FormTemplate[] = [];
  
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  pageSizeOptions: number[] = [5, 10, 15, 20];

  colDefs: ColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "title", headerName: "Title" },
    {
      field: "customise",
      headerName: "Customise",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
                <button class="icon-button" onclick="handleIconClick('${params.data.id}')">
                  <img src="${params.data.icon || '../../../assets/icons/customise.svg'}" alt="Icon" height="32" width="32" class="mr-2" />
                </button>
              </div>`;
      }
    },
    {
      field: "delete",
      headerName: "Delete",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
            <button class="icon-button" onclick="handleDeleteClick('${params.data.id}')">
              <img src="${params.data.icon2|| '../../../assets/icons/delete.svg'}" alt="Trash Icon" height="32" width="32" class="mr-2" />
            </button>
          </div>`;
      }
    }
  ];

  isBrowser: boolean;
  dialog = inject(Dialog);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private formTemplateService: FormTemplateService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      (window as any).handleIconClick = this.handleIconClick.bind(this);
      (window as any).handleDeleteClick = this.handleDeleteClick.bind(this);
    }
  }


  ngOnInit(): void {
    this.loadTemplatesFromBackend();
  }

  loadTemplatesFromBackend(): void {
    this.formTemplateService.getAllFormTemplates().subscribe({
      next: (templates: FormTemplate[]) => {
        this.allTemplates = templates.map(template => ({
          ...template,
          icon: template.icon || '../../../assets/icons/customise.svg',
          icon2: template.icon2 || '../../../assets/icons/delete.svg',
        }));
        
        this.totalPages = Math.ceil(this.allTemplates.length / this.itemsPerPage);
        
        this.updatePageData();
        
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching form templates:', error);
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(FormTemplateCreateComponent, {
      disableClose: false,
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-dialog-backdrop',
    });

    dialogRef.closed.subscribe((value: unknown) => {
      const result = value as FormTemplate | undefined;
      if (result) {
        this.allTemplates = [...this.allTemplates, result];
        
        this.totalPages = Math.ceil(this.allTemplates.length / this.itemsPerPage);
        
        this.goToPage(this.totalPages);
        
        this.changeDetector.detectChanges();
      }
    });
  }

  handleIconClick(id: string) {
    console.log('Navigating to editor-tree for template ID:', id);
    this.router.navigate(['/admin/editor-tree', id]);
  }

  handleDeleteClick(id: string) {
    const formTemplateId = parseInt(id, 10);
    if (confirm("Are you sure you want to delete this form ?")) {
      this.formTemplateService.deleteFormTemplate(formTemplateId).subscribe({
        next: () => {
          this.allTemplates = this.allTemplates.filter(template => template.id !== formTemplateId);
          
          this.totalPages = Math.ceil(this.allTemplates.length / this.itemsPerPage);
          
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
          }
          
          this.updatePageData();
          
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error("Error deleting form template:", error);
        }
      });
    }
  }
  
  getMaxItems(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.allTemplates.length);
  }
  
  updatePageData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allTemplates.length);
    this.rowData = this.allTemplates.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePageData();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageData();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageData();
    }
  }
  
  onPageSizeChange(): void {
    this.totalPages = Math.ceil(this.allTemplates.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    this.updatePageData();
  }
}
