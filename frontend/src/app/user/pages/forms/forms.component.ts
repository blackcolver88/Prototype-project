import { ChangeDetectorRef, Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormTemplate } from '../../../model/FormTemplate';
import { ColDef } from 'ag-grid-community';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { FormTemplateService } from '../../../services/form-template.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormTemplateCreateComponent } from '../../../pages/form-template/components/form-template-create/form-template-create.component';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-forms',
  imports: [AgGridAngular, CommonModule, DialogModule],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.css'
})
export class FormsComponent implements OnInit {
rowData: FormTemplate[] = [];

  colDefs: ColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "title", headerName: "Title" },
    {
      field: "Respond",
      headerName: "Respond",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
                <button class="icon-button" onclick="handleIconClick('${params.data.id}')">
                  <span class="mr-2">📝</span> 
                </button> 
              </div>`;
      }
    },
  
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
          icon: template.icon || '../../../assets/icons/customise.svg',
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
    this.router.navigate(['/formvalue', id]);
  }


  
}
