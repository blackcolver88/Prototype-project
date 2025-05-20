import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgGridAngular } from "ag-grid-angular";
import { ColDef } from 'ag-grid-community';
import { Router, RouterLink } from '@angular/router';  
import { ProcessService } from '../../../services/process.service';
import { DiagramService } from '../../../services/diagram.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-processes-page',
  standalone: true,
  imports: [AgGridAngular, CommonModule, RouterLink],  
  templateUrl: './processes-page.component.html',
  styleUrl: './processes-page.component.css'
})
export class ProcessesPageComponent implements OnInit {
  rowData: any[] = [];
  isBrowser: boolean;

  colDefs: ColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "name", headerName: "Name" },
    { field: "key", headerName: "Key" },
    { field: "version", headerName: "Version" },
    { field: "deploymentId", headerName: "Deployment ID" },
    {
      field: "edit",
      headerName: "Edit",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
                <button class="icon-button" onclick="handleEditClick('${params.data.id}')">
                  <img src="../../../assets/icons/customise.svg" alt="Edit" height="32" width="32" class="mr-2" />
                </button>
              </div>`;
      }
    },
    {
      field: "delete",
      headerName: "Delete",
      cellRenderer: (params: any) => {
        return `<div class="flex items-center">
            <button class="icon-button" onclick="handleDeleteClick('${params.data.id}', '${params.data.deploymentId}')">
              <img src="../../../assets/icons/delete.svg" alt="Delete" height="32" width="32" class="mr-2" />
            </button>
          </div>`;
      }
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private processService: ProcessService,
    private diagramService: DiagramService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      (window as any).handleEditClick = this.handleEditClick.bind(this);
      (window as any).handleDeleteClick = this.handleDeleteClick.bind(this);
    }
  }

  ngOnInit(): void {
    this.loadProcesses();
  }

  loadProcesses(): void {
    this.diagramService.getDeployedProcesses().subscribe({
      next: (processes) => {
        this.rowData = processes;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching process definitions:', error);
      }
    });
  }

  onGridReady(params: any): void {
    console.log('Grid is ready');
    
  }

  createNewProcess(): void {
    console.log('Creating new process');
    this.router.navigate(['/admin/diagram']);
  }

  handleEditClick(processId: string): void {
    console.log('Editing process:', processId);
    window.location.href = `/admin/diagram?processId=${processId}`;
  }

  async handleDeleteClick(processId: string, deploymentId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this process? This cannot be undone.')) {
      try {
        await lastValueFrom(this.processService.deleteDeployment(deploymentId, true));
        
        this.rowData = this.rowData.filter(process => process.id !== processId);
        this.changeDetector.detectChanges();
        
        this.showNotification('Process deleted successfully');
      } catch (error) {
        console.error('Error deleting process:', error);
        this.showNotification('Failed to delete process', 'error');
      }
    }
  }

  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-3 rounded shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}
