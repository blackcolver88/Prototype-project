import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ProcessService } from '../../../../services/process.service';
import { FormTemplateService } from '../../../../services/form-template.service';
import { RoleService } from '../../../../services/role.service';

export interface ProcessSelectionData {
  formTemplateId: number;
  formTitle: string;
}

export interface ProcessInfo {
  processDefinitionKey: string;
  processName: string;
  selected: boolean;
  targetRole?: string;
}

@Component({
  selector: 'app-process-selection-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './process-selection-dialog.component.html',
  styleUrls: ['./process-selection-dialog.component.css']
})
export class ProcessSelectionDialogComponent implements OnInit {
  availableProcesses: ProcessInfo[] = [];
  availableRoles: string[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private dialogRef: DialogRef<ProcessSelectionDialogComponent>,
    @Inject(DIALOG_DATA) public data: ProcessSelectionData,
    private processService: ProcessService,
    private formTemplateService: FormTemplateService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.loading = true;
    this.error = null;

    // Load all available processes, currently associated processes, and available roles
    Promise.all([
      this.processService.getLatestProcessDefinitions().toPromise(),
      this.formTemplateService.getAssociatedProcesses(this.data.formTemplateId).toPromise(),
      this.roleService.getAvailableRoles().toPromise()
    ]).then(([allProcesses, associatedProcesses, roles]) => {
      this.availableRoles = roles || [];
      
      const associatedProcessMap = new Map<string, {selected: boolean, targetRole: string}>();
      (associatedProcesses?.associatedProcesses || []).forEach((p: any) => {
        associatedProcessMap.set(p.processDefinitionKey, {
          selected: true,
          targetRole: p.targetRole || ''
        });
      });

      this.availableProcesses = (allProcesses || [])
        .filter((p: any) => p.suspended === false)
        .map((process: any) => {
          const association = associatedProcessMap.get(process.key);
          return {
            processDefinitionKey: process.key,
            processName: process.name || process.key,
            selected: association ? association.selected : false,
            targetRole: association ? association.targetRole : ''
          };
        });

      this.loading = false;
    }).catch(error => {
      console.error('Error loading processes:', error);
      this.error = 'Failed to load processes. Please try again.';
      this.loading = false;
    });
  }

  onProcessToggle(process: ProcessInfo) {
    process.selected = !process.selected;
  }

  onTargetRoleChange(process: ProcessInfo, targetRole: string) {
    process.targetRole = targetRole;
  }

  save() {
    const selectedProcesses = this.availableProcesses
      .filter(p => p.selected)
      .map(p => ({
        processDefinitionKey: p.processDefinitionKey,
        processName: p.processName,
        targetRole: p.targetRole
      }));

    const request = {
      processes: selectedProcesses
    };

    this.formTemplateService.associateProcesses(this.data.formTemplateId, request)
      .subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error saving process associations:', error);
          this.error = 'Failed to save process associations. Please try again.';
        }
      });
  }

  cancel() {
    this.dialogRef.close();
  }
}
