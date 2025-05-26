import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../services/process.service';
import { FormTemplateService } from '../../services/form-template.service';

@Component({
  selector: 'app-process-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './process-selector.component.html',
  styleUrls: ['./process-selector.component.css']
})
export class ProcessSelectorComponent implements OnInit {
  @Input() selectedProcessKey: string = '';
  @Input() formTemplateId: number | null = null; // New input for form template filtering
  @Output() processSelected = new EventEmitter<string>();

  availableProcesses: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private processService: ProcessService,
    private formTemplateService: FormTemplateService
  ) {}

  ngOnInit() {
    this.loadAvailableProcesses();
  }

  loadAvailableProcesses() {
    this.loading = true;
    this.error = null;

    if (this.formTemplateId) {
      // If formTemplateId is provided, load only associated processes
      this.formTemplateService.getAssociatedProcesses(this.formTemplateId)
        .subscribe({
          next: (response) => {
            this.availableProcesses = response.associatedProcesses || [];

            if (!this.selectedProcessKey && this.availableProcesses.length > 0) {
              this.selectedProcessKey = this.availableProcesses[0].processDefinitionKey;
              this.processSelected.emit(this.selectedProcessKey);
            }

            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading associated processes:', err);
            this.error = 'Failed to load available processes. Please try again.';
            this.loading = false;
          }
        });
    } else {
      // If no formTemplateId, load all processes (original behavior)
      this.processService.getLatestProcessDefinitions()
        .subscribe({
          next: (processes) => {
            this.availableProcesses = processes.filter(p => p.suspended === false);

            if (!this.selectedProcessKey && this.availableProcesses.length > 0) {
              this.selectedProcessKey = this.availableProcesses[0].key;
              this.processSelected.emit(this.selectedProcessKey);
            }

            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading processes:', err);
            this.error = 'Failed to load available processes. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  onProcessChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedProcessKey = select.value;
    this.processSelected.emit(this.selectedProcessKey);
  }
}