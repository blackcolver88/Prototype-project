import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ProcessService } from '../../../../services/process.service';
import { FormTemplateService } from '../../../../services/form-template.service';

export interface ProcessSelectionData {
  formTemplateId: number;
  formTitle: string;
}

export interface ProcessInfo {
  processDefinitionKey: string;
  processName: string;
  selected: boolean;
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
  loading = true;
  error: string | null = null;

  constructor(
    private dialogRef: DialogRef<ProcessSelectionDialogComponent>,
    @Inject(DIALOG_DATA) public data: ProcessSelectionData,
    private processService: ProcessService,
    private formTemplateService: FormTemplateService
  ) {}

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.loading = true;
    this.error = null;

    // Load all available processes and currently associated processes
    Promise.all([
      this.processService.getLatestProcessDefinitions().toPromise(),
      this.formTemplateService.getAssociatedProcesses(this.data.formTemplateId).toPromise()
    ]).then(([allProcesses, associatedProcesses]) => {
      const associatedKeys = new Set(
        associatedProcesses?.associatedProcesses?.map((p: any) => p.processDefinitionKey) || []
      );

      this.availableProcesses = (allProcesses || [])
        .filter((p: any) => p.suspended === false)
        .map((process: any) => ({
          processDefinitionKey: process.key,
          processName: process.name || process.key,
          selected: associatedKeys.has(process.key)
        }));

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

  save() {
    const selectedProcesses = this.availableProcesses
      .filter(p => p.selected)
      .map(p => ({
        processDefinitionKey: p.processDefinitionKey,
        processName: p.processName
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
