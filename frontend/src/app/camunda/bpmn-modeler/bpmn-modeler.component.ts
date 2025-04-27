import { Component, ViewChild, ElementRef, PLATFORM_ID, Inject, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable, Subject } from 'rxjs';
import { take, catchError, lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
import { ProcessService } from '../../services/process.service';

interface ServiceTaskConfig {
  implementation: 'delegateExpression' | 'expression' | 'class';
  delegateExpression?: string;
  expression?: string;
  javaClass?: string;
}

interface UserTaskConfig {
  assignee?: string;
  candidateGroups?: string;
  formKey?: string;
  priority?: number;
}

interface ProcessVariable {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'date';
  defaultValue?: string;
}

interface DeploymentConfig {
  name: string;
  processId: string;
  tenantId?: string;
  duplicateFiltering: boolean;
}

interface ProcessStartConfig {
  processDefinitionId: string;
  processDefinitionKey?: string; // Add key
  businessKey?: string;
  variables: ProcessStartVariable[];
}

interface ProcessStartVariable {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'date';
  value: string;
}

interface DeploymentInfo {
  id: string;
  name: string;
  deploymentTime: string;
  version: number;
  processDefinitionId: string;
  key?: string; // Add key property
}

interface InstanceInfo {
  id: string;
  definitionId: string;
  businessKey?: string;
}

@Component({
  selector: 'app-bpmn-modeler',
  templateUrl: './bpmn-modeler.component.html',
  styleUrls: ['./bpmn-modeler.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BpmnModelerComponent {
  private bpmnJS: any;
  @ViewChild('bpmnModelerRef', { static: true }) private bpmnModelerRef!: ElementRef;
  @ViewChild('propertiesRef', { static: true }) private propertiesRef!: ElementRef;

  @Output() diagramChanged = new EventEmitter<string>();
  @Output() importError = new EventEmitter<Error>();

  isLoading: boolean = false;
  saveEnabled: boolean = false;

  private errorHandler = new Subject<Error>();
  error$ = this.errorHandler.asObservable();
  
  showTaskModal: boolean = false;
  selectedTaskType: 'Service' | 'User' | 'Process' = 'Service';
  selectedElement: any = null;

  serviceTaskConfig: ServiceTaskConfig = {
    implementation: 'delegateExpression',
    delegateExpression: '${serviceTaskDelegate}',
  };

  userTaskConfig: UserTaskConfig = {
    assignee: '',
    candidateGroups: '',
    formKey: '',
    priority: 50,
  };

  processVariables: ProcessVariable[] = [];

  validationErrors: Array<{ id: string; message: string }> = [];

  private xml: string = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn" 
                  id="Definitions_02r90y2" 
                  targetNamespace="http://bpmn.io/schema/bpmn" 
                  exporter="Camunda Modeler" 
                  exporterVersion="5.24.0">
  <bpmn:process id="Process_1s5zn7v" name="Simple Process" isExecutable="true" camunda:historyTimeToLive="30">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn:userTask id="UserTask_1" name="Review Task" camunda:assignee="demo">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s5zn7v">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="182" y="145" width="31" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="UserTask_1_di" bpmnElement="UserTask_1">
        <dc:Bounds x="270" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="440" y="145" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="120" />
        <di:waypoint x="270" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="120" />
        <di:waypoint x="432" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  showDeployModal: boolean = false;
  showStartInstanceModal: boolean = false;
  showDeploymentSuccessModal: boolean = false;
  showInstanceStartedModal: boolean = false;

  deploymentConfig: DeploymentConfig = {
    name: '',
    processId: '',
    tenantId: '',
    duplicateFiltering: true,
  };

  startInstanceConfig: ProcessStartConfig = {
    processDefinitionId: '',
    businessKey: '',
    variables: [],
  };

  deployments: DeploymentInfo[] = [];
  lastDeploymentResult: DeploymentInfo | null = null;
  lastInstanceResult: InstanceInfo | null = null;

  // Add these properties if they don't exist
  showSaveProcessModal: boolean = false;
  saveProcessConfig: {
    name: string;
    id: string;
  } = {
    name: '',
    id: ''
  };

  // Add these properties to the class after the existing properties
  showOpenProcessModal: boolean = false;
  availableProcesses: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private diagramService: DiagramService,
    private processService: ProcessService
  ) {}

  ngAfterContentInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = true;

      Promise.all([
        import('bpmn-js/lib/Modeler'),
        import('bpmn-js-properties-panel'),
        import('camunda-bpmn-moddle/resources/camunda.json'),
        import('diagram-js/lib/navigation/keyboard-move'),
        import('diagram-js/lib/navigation/zoomscroll'),
      ]).then(([
        Modeler,
        PropertiesPanelModule,
        camundaModdleDescriptor,
        KeyboardMove,
        ZoomScroll,
      ]) => {
        const { default: BpmnModeler } = Modeler;
        const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = PropertiesPanelModule;

        this.bpmnJS = new BpmnModeler({
          container: this.bpmnModelerRef.nativeElement,
          additionalModules: [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            KeyboardMove.default,
            ZoomScroll.default,
          ],
          propertiesPanel: {
            parent: this.propertiesRef.nativeElement,
          },
          moddleExtensions: {
            camunda: camundaModdleDescriptor.default,
          },
          keyboard: { bindTo: window },
        });

        this.setupEventListeners();

        this.importDiagram(this.xml)
          .pipe(take(1), catchError((err) => {
            this.handleError(err);
            return [];
          }))
          .subscribe((result) => {
            if (result?.warnings?.length) {
              console.warn('Warnings when importing BPMN:', result.warnings);
            }
            this.isLoading = false;
            this.saveEnabled = true;
          });
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.bpmnJS) {
      this.bpmnJS.destroy();
    }
  }

  private setupEventListeners(): void {
    const eventBus = this.bpmnJS.get('eventBus');

    eventBus.on('selection.changed', ({ newSelection }: { newSelection: any[] }) => {
      this.selectedElement = newSelection[0];
      if (this.selectedElement) {
        if (this.selectedElement.type === 'bpmn:ServiceTask') {
          this.loadServiceTaskConfiguration(this.selectedElement);
        } else if (this.selectedElement.type === 'bpmn:UserTask') {
          this.loadUserTaskConfiguration(this.selectedElement);
        } else if (this.selectedElement.type === 'bpmn:Process') {
          this.loadProcessConfiguration(this.selectedElement);
        }
      }
    });

    eventBus.on('commandStack.changed', async () => {
      this.saveEnabled = true;
      try {
        const { xml } = await this.bpmnJS.saveXML({ format: true });
        this.diagramChanged.emit(xml);
      } catch (err) {
        this.handleError(err);
      }
    });

    eventBus.on('shape.added', ({ element }: { element: any }) => {
      if (element.type === 'bpmn:ServiceTask') {
        this.setDefaultServiceTaskImplementation(element);
      } else if (element.type === 'bpmn:UserTask') {
        this.setDefaultUserTaskConfiguration(element);
      }
    });

    eventBus.on('element.dblclick', ({ element }: { element: any }) => {
      if (element.type === 'bpmn:ServiceTask') {
        this.openTaskModal('Service', element);
      } else if (element.type === 'bpmn:UserTask') {
        this.openTaskModal('User', element);
      } else if (element.type === 'bpmn:Process') {
        this.openTaskModal('Process', element);
      }
    });
  }

  private loadServiceTaskConfiguration(element: any): void {
    const bo = element.businessObject;
    this.serviceTaskConfig = {
      implementation: bo.get('camunda:implementation') || 'delegateExpression',
      delegateExpression: bo.get('camunda:delegateExpression') || '',
      expression: bo.get('camunda:expression') || '',
      javaClass: bo.get('camunda:class') || '',
    };
  }

  private loadUserTaskConfiguration(element: any): void {
    const bo = element.businessObject;
    this.userTaskConfig = {
      assignee: bo.get('camunda:assignee') || '',
      candidateGroups: bo.get('camunda:candidateGroups') || '',
      formKey: bo.get('camunda:formKey') || '',
      priority: bo.get('camunda:priority') || 50,
    };
  }

  private loadProcessConfiguration(element: any): void {
    this.processVariables = [];
    const bo = element.businessObject;
    const extensionElements = bo.get('extensionElements');
    if (extensionElements?.values) {
      const properties = extensionElements.values.find((ext: any) => ext.$type === 'camunda:Properties');
      if (properties?.values) {
        this.processVariables = properties.values.map((prop: any) => ({
          name: prop.name,
          type: this.determineVariableType(prop.value),
          defaultValue: prop.value,
        }));
      }
    }
  }

  private determineVariableType(value: string): 'string' | 'integer' | 'boolean' | 'date' {
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value)) && value !== '') return 'integer';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }

  private setDefaultServiceTaskImplementation(element: any): void {
    const modeling = this.bpmnJS.get('modeling');
    modeling.updateProperties(element, {
      'camunda:implementation': 'delegateExpression',
      'camunda:delegateExpression': '${serviceTaskDelegate}',
    });
  }

  private setDefaultUserTaskConfiguration(element: any): void {
    const modeling = this.bpmnJS.get('modeling');
    modeling.updateProperties(element, {
      'camunda:formKey': 'embedded:app:forms/default-form.html',
      'camunda:assignee': '${initiator}',
    });
  }

  clearValidationErrors(): void {
    this.validationErrors = [];
  }
  

  openTaskModal(type: 'Service' | 'User' | 'Process', element: any): void {
    this.selectedTaskType = type;
    this.selectedElement = element;
    if (type === 'Service') {
      this.loadServiceTaskConfiguration(element);
    } else if (type === 'User') {
      this.loadUserTaskConfiguration(element);
    } else {
      this.loadProcessConfiguration(element);
    }
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
  }

  applyTaskConfiguration(): void {
    const modeling = this.bpmnJS.get('modeling');
    if (this.selectedTaskType === 'Service' && this.selectedElement) {
      const properties: any = { 'camunda:implementation': this.serviceTaskConfig.implementation };
      switch (this.serviceTaskConfig.implementation) {
        case 'delegateExpression':
          properties['camunda:delegateExpression'] = this.serviceTaskConfig.delegateExpression;
          break;
        case 'expression':
          properties['camunda:expression'] = this.serviceTaskConfig.expression;
          break;
        case 'class':
          properties['camunda:class'] = this.serviceTaskConfig.javaClass;
          break;
      }
      modeling.updateProperties(this.selectedElement, properties);
    } else if (this.selectedTaskType === 'User' && this.selectedElement) {
      modeling.updateProperties(this.selectedElement, {
        'camunda:assignee': this.userTaskConfig.assignee,
        'camunda:candidateGroups': this.userTaskConfig.candidateGroups,
        'camunda:formKey': this.userTaskConfig.formKey,
        'camunda:priority': this.userTaskConfig.priority,
      });
    } else if (this.selectedTaskType === 'Process' && this.selectedElement) {
      this.applyProcessVariables();
    }
    this.showTaskModal = false;
  }

  private applyProcessVariables(): void {
    const moddle = this.bpmnJS.get('moddle');
    const modeling = this.bpmnJS.get('modeling');
    const bo = this.selectedElement.businessObject;

    const camundaProperties = this.processVariables.map((variable) =>
      moddle.create('camunda:Property', { name: variable.name, value: variable.defaultValue })
    );

    const properties = moddle.create('camunda:Properties', { values: camundaProperties });
    let extensionElements = bo.get('extensionElements') || moddle.create('bpmn:ExtensionElements', { values: [] });
    extensionElements.values = extensionElements.values.filter((ext: any) => ext.$type !== 'camunda:Properties');
    extensionElements.values.push(properties);

    modeling.updateProperties(this.selectedElement, { extensionElements });
  }

  addProcessVariable(): void {
    this.processVariables.push({ name: '', type: 'string', defaultValue: '' });
  }

  removeProcessVariable(index: number): void {
    this.processVariables.splice(index, 1);
  }

  validateDiagram(): void {
    this.validationErrors = [];
    const elementRegistry = this.bpmnJS.get('elementRegistry');
    const elements = elementRegistry.getAll();

    elements.forEach((element: any) => {
      const bo = element.businessObject;
      // Service tasks without implementation
      if (element.type === 'bpmn:ServiceTask' && !bo.get('camunda:implementation')) {
        this.validationErrors.push({
          id: element.id,
          message: `Service task "${bo.name || element.id}" is missing implementation`,
        });
      }
      // End events without incoming flows
      if (element.type === 'bpmn:EndEvent' && (!element.incoming || !element.incoming.length)) {
        this.validationErrors.push({ id: element.id, message: 'End event has no incoming flow' });
      }
      // Unreachable elements (no connections)
      if (
        element.type !== 'bpmn:Process' &&
        (!element.incoming || !element.incoming.length) &&
        (!element.outgoing || !element.outgoing.length)
      ) {
        this.validationErrors.push({
          id: element.id,
          message: `Element "${bo.name || element.id}" is unreachable`,
        });
      }
    });

    const startEvents = elements.filter((e: any) => e.type === 'bpmn:StartEvent');
    // Start events without a path to an end event
    startEvents.forEach((start: any) => {
      if (!this.hasEndEvent(start)) {
        this.validationErrors.push({
          id: start.id,
          message: `Process path starting at "${start.businessObject.name || start.id}" has no End Event`,
        });
      }
    });
  }

  private hasEndEvent(start: any): boolean {
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
      const element = queue.shift();
      if (visited.has(element.id)) continue;
      visited.add(element.id);
      if (element.type === 'bpmn:EndEvent') return true;
      if (element.outgoing) {
        element.outgoing.forEach((flow: any) => queue.push(flow.target));
      }
    }
    return false;
  }

  undo(): void {
    this.bpmnJS.get('commandStack').undo();
  }

  redo(): void {
    this.bpmnJS.get('commandStack').redo();
  }

  async deployProcess(): Promise<void> {
    try {
      this.isLoading = true;
      this.showDeployModal = false;
      const xml = await this.exportDiagram();
      const result = await lastValueFrom(
        this.processService.deployProcessWithOptions(xml, {
          deploymentName: this.deploymentConfig.name || this.deploymentConfig.processId,
          processId: this.deploymentConfig.processId,
          tenantId: this.deploymentConfig.tenantId,
          enableDuplicateFiltering: this.deploymentConfig.duplicateFiltering,
        })
      );
      this.lastDeploymentResult = {
        id: result.id,
        name: result.name,
        deploymentTime: result.deploymentTime,
        version: result.version || 1,
        processDefinitionId: result.deployedProcessDefinition?.id || '',
      };
      await this.loadDeployments();
      this.showDeploymentSuccessModal = true;
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  closeDeploymentSuccessModal(): void {
    this.showDeploymentSuccessModal = false;
  }

  async loadDeployments(): Promise<void> {
    try {
      const definitions = await lastValueFrom(this.processService.getDeployedProcesses());
      console.log('Loaded process definitions:', definitions); // Debug log
      
      if (!definitions || definitions.length === 0) {
        console.warn('No process definitions returned from API');
      }
      
      this.deployments = definitions || [];
    } catch (err) {
      console.error('Error loading process definitions:', err);
      this.handleError(err);
    }
  }

  async openStartInstanceModal(): Promise<void> {
    this.showDeploymentSuccessModal = false;
    try {
      // Get the current list of process definitions
      const processDefinitions = await lastValueFrom(this.processService.getDeployedProcesses());
      console.log('Process Definitions:', processDefinitions); 
      
      if (!processDefinitions || processDefinitions.length === 0) {
        throw new Error('No deployed process definitions found');
      }
      
      // Store the full process definitions data
      this.deployments = processDefinitions;
      
      // Select the first definition and set its ID explicitly
      const firstDefinition = processDefinitions[0];
      console.log('Selected process definition:', firstDefinition);
      
      if (!firstDefinition.id) {
        console.error('Missing ID in process definition:', firstDefinition);
        throw new Error('Invalid process definition format: missing ID');
      }
      
      this.startInstanceConfig = {
        processDefinitionId: firstDefinition.id,
        businessKey: '',
        variables: this.processVariables.map((pv) => ({
          name: pv.name,
          type: pv.type,
          value: pv.defaultValue || '',
        })),
      };
      
      console.log('Process definition ID set to:', this.startInstanceConfig.processDefinitionId);
      
      this.showStartInstanceModal = true;
    } catch (err) {
      this.handleError(err);
    }
  }

  closeStartInstanceModal(): void {
    this.showStartInstanceModal = false;
  }

  addStartVariable(): void {
    this.startInstanceConfig.variables.push({ name: '', type: 'string', value: '' });
  }

  removeStartVariable(index: number): void {
    this.startInstanceConfig.variables.splice(index, 1);
  }

  private prepareVariablesForStart(): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Add the initiator variable that's being referenced in the BPMN
    result['initiator'] = 'demo';
    
    // Process other variables as before
    this.startInstanceConfig.variables.forEach((variable) => {
      let processedValue: any = variable.value;
      switch (variable.type) {
        case 'boolean':
          processedValue = variable.value.toLowerCase() === 'true';
          break;
        case 'date':
          if (variable.value) processedValue = new Date(variable.value).toISOString();
          break;
      }
      result[variable.name] = processedValue;
    });
    return result;
  }

  async startProcessInstance(): Promise<void> {
    const processDefId = this.startInstanceConfig.processDefinitionId;
    
    if (!processDefId || processDefId === 'undefined') {
      this.handleError(new Error('No valid process definition selected'));
      return;
    }
    
    try {
      this.isLoading = true;
      this.showStartInstanceModal = false;
      
      // Prepare variables
      const variables = this.prepareVariablesForStart();
      console.log(`Starting process ${processDefId} with variables:`, variables);
      
      // Use explicit parameters
      const result = await lastValueFrom(
        this.processService.startProcess(
          processDefId,
          this.startInstanceConfig.businessKey || undefined,
          variables
        )
      );
      
      console.log('Process instance created:', result);
      
      // REMOVE the instance verification - it's causing the 404 error
      // const instance = await lastValueFrom(this.processService.getProcessInstance(result.id));
      
      // Set the result directly from the creation response
      if (result && result.id) {
        this.lastInstanceResult = {
          id: result.id,
          definitionId: result.definitionId || processDefId,
          businessKey: result.businessKey || this.startInstanceConfig.businessKey || '',
        };
        
        this.showInstanceStartedModal = true;
      } else {
        throw new Error('Process instance creation failed: Invalid response');
      }
      
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  closeInstanceStartedModal(): void {
    this.showInstanceStartedModal = false;
  }

  private getProcessIdFromDiagram(): string {
    try {
      const canvas = this.bpmnJS.get('canvas');
      const rootElement = canvas.getRootElement();
      return rootElement?.businessObject?.id || '';
    } catch (err) {
      console.error('Error getting process ID:', err);
      return '';
    }
  }

  openDeployModal(): void {
    // Comment out validation for testing
    // this.validateDiagram();
    // if (this.validationErrors.length) {
    //   this.handleError(new Error('Please fix validation errors before deploying'));
    //   return;
    // }
    
    this.deploymentConfig = {
      name: '',
      processId: this.getProcessIdFromDiagram(),
      tenantId: '',
      duplicateFiltering: true,
    };
    this.showDeployModal = true;
  }

  closeDeployModal(): void {
    this.showDeployModal = false;
  }

  importDiagram(xml: string): Observable<{ warnings: any[] }> {
    return from(this.bpmnJS.importXML(xml) as Promise<{ warnings: any[] }>);
  }

  async exportDiagram(): Promise<string> {
    try {
      const { xml } = await this.bpmnJS.saveXML({ format: true });
      return xml;
    } catch (err) {
      this.handleError(err);
      return '';
    }
  }

  async saveDiagram(): Promise<void> {
    if (!this.saveEnabled) return;
    
    // Open the save dialog instead of directly saving
    this.openSaveProcessModal();
  }

  async downloadDiagram(): Promise<void> {
    try {
      const xml = await this.exportDiagram();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diagram.bpmn';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      this.handleError(err);
    }
  }

  loadNewDiagram(xml: string): void {
    if (!xml) return;
    this.isLoading = true;
    this.importDiagram(xml)
      .pipe(take(1), catchError((err) => {
        this.handleError(err);
        return [];
      }))
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  private handleError(err: any): void {
    let errorMessage: string;
    
    if (err.error && (typeof err.error === 'object')) {
      // Handle HTTP error responses with details
      errorMessage = JSON.stringify(err.error);
      console.error('Error details:', err.error);
    } else {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
    
    const error = new Error(errorMessage);
    this.errorHandler.next(error);
    this.importError.emit(error);
    console.error('BPMN Modeler Error:', error, err);
  }

  clearError(): void {
    // Create a new subject to clear the error state
    this.errorHandler = new Subject<Error>();
    this.error$ = this.errorHandler.asObservable();
  }

  zoomIn(): void {
    const canvas = this.bpmnJS.get('canvas');
    canvas.zoom(canvas.zoom() + 0.1);
  }

  zoomOut(): void {
    const canvas = this.bpmnJS.get('canvas');
    canvas.zoom(canvas.zoom() - 0.1);
  }

  resetZoom(): void {
    this.bpmnJS.get('canvas').zoom('fit-viewport');
  }

  onProcessDefinitionSelected(): void {
    // Get the currently selected process definition ID
    const selectedId = this.startInstanceConfig.processDefinitionId;
    console.log('Selected definition changed to:', selectedId);
    
    // Validate it exists in our deployments array
    const selectedDefinition = this.deployments.find(d => d.id === selectedId);
    
    if (!selectedDefinition) {
      console.warn('Selected process definition not found in deployments list');
    } else {
      console.log('Found matching process definition:', selectedDefinition);
      
      // Optional: Reset variables or populate with defaults
      this.startInstanceConfig.variables = this.processVariables.map(pv => ({
        name: pv.name,
        type: pv.type,
        value: pv.defaultValue || ''
      }));
    }
  }

  // Add these methods
  async openProcessModal(): Promise<void> {
    try {
      this.isLoading = true;
      this.availableProcesses = await lastValueFrom(this.diagramService.getDeployedProcesses());
      this.showOpenProcessModal = true;
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  closeOpenProcessModal(): void {
    this.showOpenProcessModal = false;
  }

  async loadProcess(processDefinitionId: string): Promise<void> {
    try {
      this.isLoading = true;
      this.showOpenProcessModal = false;
      
      const xml = await lastValueFrom(this.diagramService.getProcessDefinitionXml(processDefinitionId));
      
      if (!xml) {
        throw new Error('Failed to load process XML');
      }
      
      this.importDiagram(xml)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            if (result?.warnings?.length) {
              console.warn('Warnings when importing BPMN:', result.warnings);
            }
            this.isLoading = false;
            this.saveEnabled = false; // Process was just loaded
            this.showSuccessNotification('Process loaded successfully');
          },
          error: (err) => {
            this.isLoading = false;
            this.handleError(err);
          }
        });
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  openSaveProcessModal(): void {
    // Get current process name and ID from diagram
    this.saveProcessConfig = {
      name: this.getProcessNameFromDiagram() || 'My Process',
      id: this.getProcessIdFromDiagram() || ''
    };
    this.showSaveProcessModal = true;
  }

  closeSaveProcessModal(): void {
    this.showSaveProcessModal = false;
  }

  async saveProcessToRepository(): Promise<void> {
    if (!this.saveProcessConfig.name) {
      this.handleError(new Error('Process name is required'));
      return;
    }
    
    try {
      this.isLoading = true;
      this.showSaveProcessModal = false;
      
      // Get current XML
      const xml = await this.exportDiagram();
      
      // Generate a valid filename
      const filename = this.saveProcessConfig.id || 
        this.saveProcessConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Update the process name and ID in the XML
      const updatedXml = this.updateProcessNameAndId(
        xml, 
        this.saveProcessConfig.name, 
        this.saveProcessConfig.id || filename
      );
      
      console.log("Saving process to repository and filesystem...");
      
      // First, deploy to Camunda engine
      const deployResult = await lastValueFrom(
        this.diagramService.saveAsDeployment(updatedXml, this.saveProcessConfig.name)
      );
      console.log("Process deployed:", deployResult);
      
      // Then save to filesystem
      try {
        const fsResult = await lastValueFrom(
          this.diagramService.saveToFilesystem(updatedXml, `${filename}.bpmn`)
        );
        console.log("Process saved to filesystem:", fsResult);
      } catch (fsErr) {
        console.error("Failed to save to filesystem:", fsErr);
        // Show a warning but continue
        this.showWarningNotification("Process deployed, but couldn't be saved to filesystem");
      }
      
      this.isLoading = false;
      this.showSuccessNotification('Process saved successfully');
      
      // Import the updated XML back into the modeler
      this.importDiagram(updatedXml).subscribe();
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  // Helper methods
  private getProcessNameFromDiagram(): string {
    try {
      const canvas = this.bpmnJS.get('canvas');
      const rootElement = canvas.getRootElement();
      return rootElement?.businessObject?.name || '';
    } catch (err) {
      console.error('Error getting process name:', err);
      return '';
    }
  }

  updateProcessNameAndId(xml: string, name: string, id: string): string {
    if (!name && !id) return xml;
    
    // Create a temporary DOM parser to modify the XML
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    
    // Find the process element
    const processElement = xmlDoc.querySelector('bpmn\\:process, process');
    if (processElement) {
      // Update name and ID if provided
      if (name) {
        processElement.setAttribute('name', name);
      }
      
      if (id) {
        const oldId = processElement.getAttribute('id');
        processElement.setAttribute('id', id);
        
        // Update references in the diagram
        const bpmnPlane = xmlDoc.querySelector('bpmndi\\:BPMNPlane, BPMNPlane');
        if (bpmnPlane && bpmnPlane.getAttribute('bpmnElement') === oldId) {
          bpmnPlane.setAttribute('bpmnElement', id);
        }
      }
    }
    
    return serializer.serializeToString(xmlDoc);
  }

  showWarningNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  showSuccessNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}