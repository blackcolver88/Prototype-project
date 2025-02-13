import { ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgGridAngular } from "ag-grid-angular";
import { ColDef } from 'ag-grid-community';
import { Dialog, DialogModule } from "@angular/cdk/dialog";
import { FormTemplateCreateComponent } from "./components/form-template-create/form-template-create.component";
import { FormTemplate } from "../../model/FormTemplate";
import { Router } from '@angular/router';
import { FormTemplateService } from "../../services/form-template.service";


@Component({
  selector: 'app-form-template',
  standalone: true,
  imports: [AgGridAngular, CommonModule, DialogModule],
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.css']
})
export class FormTemplateComponent implements OnInit {
  rowData: FormTemplate[] = [];

  colDefs: ColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "title", headerName: "Title" },
    {
      field: "customise",
      headerName: "Customise",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
                <button class="icon-button" onclick="handleIconClick('${params.data.id}')">
                  <img src="${params.data.icon || '../../../assets/icons/adjustment.svg'}" alt="Icon" height="32" width="32" class="mr-2" />
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
              <img src="${params.data.icon2|| '../../../assets/icons/adjustment.svg'}" alt="Trash Icon" height="32" width="32" class="mr-2" />
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
        this.rowData = templates.map(template => ({
          ...template,
          icon: template.icon || '../../../assets/icons/adjustment.svg',
          icon2: template.icon2 || '../../../assets/icons/trash.svg',
        }));
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
        this.rowData = [...this.rowData, result];
        this.changeDetector.detectChanges();
      }
    });
  }

  handleIconClick(id: string) {
    console.log('Navigating to editor-tree for template ID:', id);
    this.router.navigate(['/editor-tree', id]);
  }

  handleDeleteClick(id: string) {
    const formTemplateId = parseInt(id, 10);
    if (confirm("Are you sure you want to delete this template?")) {
      this.formTemplateService.deleteFormTemplate(formTemplateId).subscribe({
        next: () => {
          this.rowData = this.rowData.filter(template => template.id !== formTemplateId);
          this.changeDetector.detectChanges();  // Trigger change detection to update the UI
        },
        error: (error) => {
          console.error("Error deleting form template:", error);
        }
      });
    }
  }
}
