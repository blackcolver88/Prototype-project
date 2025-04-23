import { Component, ViewChild, ElementRef, PLATFORM_ID, Inject, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable, Subject } from 'rxjs';
import { take, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Service imports
import { DiagramService } from '../../services/diagram.service';
import { ProcessService } from '../../services/process.service';

// Define interfaces for our task configurations
interface ServiceTaskConfig {
  implementation: string;
  delegateExpression?: string;
  expression?: string;
  javaClass?: string;
  topic?: string;
  connectorId?: string;
}

interface UserTaskConfig {
  assignee?: string;
  candidateGroups?: string;
  candidateUsers?: string;
  formKey?: string;
  priority?: number;
}

interface ProcessVariable {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'date' | 'json';
  defaultValue?: string;
}

interface ElementTemplate {
  id: string;
  name: string;
  appliesTo: string[];
  properties: any[];
}

interface DeploymentConfig {
  name: string;
  processId: string;
  tenantId?: string;
  duplicateFiltering: boolean;
  deployChangedOnly: boolean;
}

interface ProcessStartConfig {
  processDefinitionId: string;
  businessKey?: string;
  variables: ProcessStartVariable[];
}

interface ProcessStartVariable {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'date' | 'json';
  value: string;
}

interface DeploymentInfo {
  id: string;
  name: string;
  deploymentTime: string;
  version: number;
  processDefinitionId: string;
}

interface InstanceInfo {
  id: string;
  definitionId: string;
  businessKey?: string;
}

@Component({
  selector: 'app-bpmn-modeler',
  templateUrl: './bpmn-modeler.component.html',
  styleUrl: './bpmn-modeler.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class BpmnModelerComponent {
  private bpmnJS: any;
  @ViewChild('bpmnModelerRef', { static: true }) private bpmnModelerRef: ElementRef | undefined;
  @ViewChild('propertiesRef', { static: true }) private propertiesRef: ElementRef | undefined;
  
  // Event emitters for parent components
  @Output() diagramChanged = new EventEmitter<string>();
  @Output() importError = new EventEmitter<Error>();
  @Output() selectionChanged = new EventEmitter<any>();
  @Output() deployed = new EventEmitter<any>();
  
  // Control flags
  public isLoading: boolean = false;
  public saveEnabled: boolean = false;
  
  // For managing errors
  private errorHandler = new Subject<Error>();
  public error$ = this.errorHandler.asObservable();
  
  // Task configuration modal properties
  public showTaskModal: boolean = false;
  public selectedTaskType: 'Service' | 'User' | 'Process' = 'Service';
  public selectedElement: any = null;
  
  // Task configurations
  public serviceTaskConfig: ServiceTaskConfig = {
    implementation: 'delegateExpression',
    delegateExpression: '${serviceTaskDelegate}'
  };
  
  public userTaskConfig: UserTaskConfig = {
    assignee: '',
    candidateGroups: '',
    formKey: '',
    priority: 50
  };
  
  // Process variables
  public processVariables: ProcessVariable[] = [];
  
  // Element templates
  public elementTemplates: ElementTemplate[] = [];
  public showTemplateDropdown: boolean = false;
  
  // Validation
  public validationErrors: Array<{id: string, message: string}> = [];
  
  // BPMN XML
  private xml: string = `<?xml version="1.0" encoding="UTF-8"?>
  <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_02r90y2" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.24.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.21.0">
    <bpmn:process id="Process_1s5zn7v" isExecutable="true" camunda:historyTimeToLive="10">
      <bpmn:startEvent id="StartEvent_1" />
    </bpmn:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s5zn7v">
        <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
          <dc:Bounds x="179" y="102" width="36" height="36" />
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn:definitions>`;
  
  // Deployment related properties
  public showDeployModal: boolean = false;
  public showStartInstanceModal: boolean = false;
  public showDeploymentSuccessModal: boolean = false;
  public showInstanceStartedModal: boolean = false;
  
  public deploymentConfig: DeploymentConfig = {
    name: '',
    processId: '',
    tenantId: '',
    duplicateFiltering: true,
    deployChangedOnly: false
  };
  
  public startInstanceConfig: ProcessStartConfig = {
    processDefinitionId: '',
    businessKey: '',
    variables: []
  };
  
  public deployments: DeploymentInfo[] = [];
  public lastDeploymentResult: DeploymentInfo | null = null;
  public lastInstanceResult: InstanceInfo | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private diagramService: DiagramService,
    private processService: ProcessService
  ) {}

  ngAfterContentInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = true;
      
      // Load element templates
      this.loadElementTemplates();
      
      Promise.all([
        import('bpmn-js/lib/Modeler'),
        import('bpmn-js-token-simulation'),
        import('bpmn-js-properties-panel'),
        import('@bpmn-io/properties-panel'),
        import('camunda-bpmn-moddle/resources/camunda.json'),
        import('diagram-js/lib/navigation/keyboard-move'),
        import('diagram-js/lib/navigation/zoomscroll'),
        import('diagram-js-grid')
      ]).then(([
        Modeler, 
        TokenSimulationModule, 
        PropertiesPanelModule, 
        PropertiesPanelStyle,
        camundaModdleDescriptor,
        KeyboardMove,
        ZoomScroll,
        DiagramJSGrid
      ]) => {
        const { default: BpmnModeler } = Modeler;
        const { default: TokenSimulation } = TokenSimulationModule;
        const { 
          BpmnPropertiesPanelModule, 
          BpmnPropertiesProviderModule
        } = PropertiesPanelModule;
        
        // Initialize the modeler with enhanced configuration
        this.bpmnJS = new BpmnModeler({
          container: this.bpmnModelerRef?.nativeElement,
          additionalModules: [
            TokenSimulation,
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            KeyboardMove.default,
            ZoomScroll?.default,
            DiagramJSGrid?.default
          ],
          propertiesPanel: {
            parent: this.propertiesRef?.nativeElement
          },
          moddleExtensions: {
            camunda: camundaModdleDescriptor.default
          },
          keyboard: {
            bindTo: window
          },
          grid: {
            visible: true
          },
          bpmnRenderer: {
            defaultFillColor: '#f2f2f2',
            defaultStrokeColor: '#000000'
          },
          elementTemplates: this.elementTemplates
        });
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Import diagram
        this.importDiagram(this.xml).pipe(
          take(1),
          catchError(err => {
            this.handleError(err);
            return [];
          })
        ).subscribe(
          result => {
            if (result && result.warnings && result.warnings.length) {
              console.warn('Warnings when importing BPMN:', result.warnings);
            }
            this.isLoading = false;
            this.saveEnabled = true;
          }
        );
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.bpmnJS) {
      this.bpmnJS.destroy();
    }
  }

  // Setup event listeners for the BPMN modeler
  private setupEventListeners(): void {
    const eventBus = this.bpmnJS.get('eventBus');
    
    // Element selection change events
    eventBus.on('selection.changed', (e: any) => {
      this.selectionChanged.emit(e);
      
      const selectedElement = e.newSelection[0];
      this.selectedElement = selectedElement;
      
      if (selectedElement) {
        // Handle different element types
        if (selectedElement.type === 'bpmn:ServiceTask') {
          this.loadServiceTaskConfiguration(selectedElement);
        } else if (selectedElement.type === 'bpmn:UserTask') {
          this.loadUserTaskConfiguration(selectedElement);
        } else if (selectedElement.type === 'bpmn:Process') {
          this.loadProcessConfiguration(selectedElement);
        }
      }
    });
    
    // Listen for changes to the diagram
    eventBus.on('commandStack.changed', async () => {
      this.saveEnabled = true;
      try {
        const result = await this.bpmnJS.saveXML({ format: true });
        this.diagramChanged.emit(result.xml);
      } catch (err) {
        this.handleError(err);
      }
    });
    
    // Element creation events
    eventBus.on('shape.added', (event: any) => {
      const element = event.element;
      if (element.type === 'bpmn:ServiceTask') {
        this.setDefaultServiceTaskImplementation(element);
      } else if (element.type === 'bpmn:UserTask') {
        this.setDefaultUserTaskConfiguration(element);
      }
    });
    
    // Double-click to open configuration
    eventBus.on('element.dblclick', (event: any) => {
      const element = event.element;
      
      if (element.type === 'bpmn:ServiceTask') {
        this.openTaskModal('Service', element);
      } else if (element.type === 'bpmn:UserTask') {
        this.openTaskModal('User', element);
      } else if (element.type === 'bpmn:Process') {
        this.openTaskModal('Process', element);
      }
    });
  }

  // Load element templates (would come from a service in a real app)
  private loadElementTemplates(): void {
    this.elementTemplates = [
      {
        id: 'rest-service',
        name: 'REST Service Task',
        appliesTo: ['bpmn:ServiceTask'],
        properties: [
          { id: 'url', value: 'https://api.example.com/endpoint' },
          { id: 'method', value: 'GET' },
        ]
      },
      {
        id: 'email-service',
        name: 'Email Service',
        appliesTo: ['bpmn:ServiceTask'],
        properties: [
          { id: 'recipient', value: '${recipient}' },
          { id: 'subject', value: 'Process Notification' },
          { id: 'template', value: 'notification-template' }
        ]
      },
      {
        id: 'approval-task',
        name: 'Approval User Task',
        appliesTo: ['bpmn:UserTask'],
        properties: [
          { id: 'formKey', value: 'embedded:app:forms/approval-form.html' },
          { id: 'candidateGroups', value: 'management' },
        ]
      }
    ];
  }

  // Service task configuration
  private loadServiceTaskConfiguration(element: any): void {
    const businessObject = element.businessObject;
    
    this.serviceTaskConfig = {
      implementation: businessObject.get('camunda:implementation') || 'delegateExpression',
      delegateExpression: businessObject.get('camunda:delegateExpression') || '',
      expression: businessObject.get('camunda:expression') || '',
      javaClass: businessObject.get('camunda:class') || '',
      topic: businessObject.get('camunda:topic') || '',
      connectorId: businessObject.get('camunda:connectorId') || ''
    };
  }

  // User task configuration
  private loadUserTaskConfiguration(element: any): void {
    const businessObject = element.businessObject;
    
    this.userTaskConfig = {
      assignee: businessObject.get('camunda:assignee') || '',
      candidateGroups: businessObject.get('camunda:candidateGroups') || '',
      candidateUsers: businessObject.get('camunda:candidateUsers') || '',
      formKey: businessObject.get('camunda:formKey') || '',
      priority: businessObject.get('camunda:priority') || 50
    };
  }

  // Process configuration
  private loadProcessConfiguration(element: any): void {
    // In a real app, you would load process variables from extensions or custom properties
    this.processVariables = [];
    
    // Here we would add code to extract existing variables from the process definition
    const businessObject = element.businessObject;
    const extensionElements = businessObject.get('extensionElements');
    
    if (extensionElements && extensionElements.values) {
      const properties = extensionElements.values.find((ext: any) => 
        ext.$type === 'camunda:Properties'
      );
      
      if (properties && properties.values) {
        this.processVariables = properties.values.map((prop: any) => ({
          name: prop.name,
          type: this.determineVariableType(prop.value),
          defaultValue: prop.value
        }));
      }
    }
  }

  // Helper to determine variable type
  private determineVariableType(value: string): 'string' | 'integer' | 'boolean' | 'date' | 'json' {
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value)) && value !== '') return 'integer';
    if (value.startsWith('{') && value.endsWith('}')) return 'json';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }

  // Set default service task implementation
  private setDefaultServiceTaskImplementation(element: any): void {
    const modeling = this.bpmnJS.get('modeling');
    modeling.updateProperties(element, {
      'camunda:implementation': 'delegateExpression',
      'camunda:delegateExpression': '${serviceTaskDelegate}'
    });
  }

  // Set default user task configuration
  private setDefaultUserTaskConfiguration(element: any): void {
    const modeling = this.bpmnJS.get('modeling');
    modeling.updateProperties(element, {
      'camunda:formKey': 'embedded:app:forms/default-form.html',
      'camunda:assignee': '${initiator}'
    });
  }

  // Open task configuration modal
  public openTaskModal(type: 'Service' | 'User' | 'Process', element: any): void {
    this.selectedTaskType = type;
    this.selectedElement = element;
    
    // Load appropriate configuration
    if (type === 'Service') {
      this.loadServiceTaskConfiguration(element);
    } else if (type === 'User') {
      this.loadUserTaskConfiguration(element);
    } else if (type === 'Process') {
      this.loadProcessConfiguration(element);
    }
    
    this.showTaskModal = true;
  }

  // Close task modal
  public closeTaskModal(): void {
    this.showTaskModal = false;
  }

  // Apply task configuration
  public applyTaskConfiguration(): void {
    const modeling = this.bpmnJS.get('modeling');
    
    if (this.selectedTaskType === 'Service' && this.selectedElement) {
      let properties: any = {
        'camunda:implementation': this.serviceTaskConfig.implementation
      };
      
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
        case 'externalTask':
          properties['camunda:topic'] = this.serviceTaskConfig.topic;
          break;
        case 'connector':
          properties['camunda:connectorId'] = this.serviceTaskConfig.connectorId;
          break;
      }
      
      modeling.updateProperties(this.selectedElement, properties);
    }
    else if (this.selectedTaskType === 'User' && this.selectedElement) {
      modeling.updateProperties(this.selectedElement, {
        'camunda:assignee': this.userTaskConfig.assignee,
        'camunda:candidateGroups': this.userTaskConfig.candidateGroups,
        'camunda:candidateUsers': this.userTaskConfig.candidateUsers,
        'camunda:formKey': this.userTaskConfig.formKey,
        'camunda:priority': this.userTaskConfig.priority
      });
    }
    else if (this.selectedTaskType === 'Process' && this.selectedElement) {
      // Apply process variables - this is more complex and requires extension elements
      this.applyProcessVariables();
    }
    
    this.showTaskModal = false;
  }

  // Apply process variables to the process
  private applyProcessVariables(): void {
    const moddle = this.bpmnJS.get('moddle');
    const modeling = this.bpmnJS.get('modeling');
    const businessObject = this.selectedElement.businessObject;
    
    // Create properties for process variables
    const camundaProperties = this.processVariables.map(variable => {
      return moddle.create('camunda:Property', {
        name: variable.name,
        value: variable.defaultValue
      });
    });
    
    // Create camunda:Properties element
    const properties = moddle.create('camunda:Properties', {
      values: camundaProperties
    });
    
    // Create extensionElements if it doesn't exist
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = moddle.create('bpmn:ExtensionElements', {
        values: [properties]
      });
      modeling.updateProperties(this.selectedElement, {
        extensionElements: extensionElements
      });
    } else {
      // Remove old properties if they exist
      extensionElements.values = extensionElements.values.filter((ext: any) => 
        ext.$type !== 'camunda:Properties'
      );
      
      // Add new properties
      extensionElements.values.push(properties);
      modeling.updateProperties(this.selectedElement, {
        extensionElements: extensionElements
      });
    }
  }

  // Add a new process variable
  public addProcessVariable(): void {
    this.processVariables.push({
      name: '',
      type: 'string',
      defaultValue: ''
    });
  }

  // Remove a process variable
  public removeProcessVariable(index: number): void {
    this.processVariables.splice(index, 1);
  }

  // Element template dropdown
  public toggleTemplateDropdown(): void {
    this.showTemplateDropdown = !this.showTemplateDropdown;
  }

  // Apply an element template
  public applyTemplate(template: ElementTemplate): void {
    if (!this.selectedElement) {
      this.handleError(new Error('No element selected'));
      this.showTemplateDropdown = false;
      return;
    }
    
    if (!template.appliesTo.includes(this.selectedElement.type)) {
      this.handleError(new Error(`Template doesn't apply to ${this.selectedElement.type}`));
      this.showTemplateDropdown = false;
      return;
    }
    
    const modeling = this.bpmnJS.get('modeling');
    const elementTemplates = this.bpmnJS.get('elementTemplates');
    
    if (elementTemplates) {
      try {
        // Using the element templates module directly if available
        elementTemplates.applyTemplate(this.selectedElement, template);
      } catch (err) {
        // Fallback to manual property application
        const properties: any = {
          'camunda:modelerTemplate': template.id
        };
        
        // Apply all template properties
        template.properties.forEach(prop => {
          properties[`camunda:${prop.id}`] = prop.value;
        });
        
        modeling.updateProperties(this.selectedElement, properties);
      }
    } else {
      // Fallback if element templates module isn't available
      const properties: any = {
        'camunda:modelerTemplate': template.id
      };
      
      // Apply all template properties
      template.properties.forEach(prop => {
        properties[`camunda:${prop.id}`] = prop.value;
      });
      
      modeling.updateProperties(this.selectedElement, properties);
    }
    
    this.showTemplateDropdown = false;
  }

  // Validate diagram
  public validateDiagram(): void {
    this.validationErrors = [];
    
    // Basic validation
    const elementRegistry = this.bpmnJS.get('elementRegistry');
    const elements = elementRegistry.getAll();
    
    elements.forEach((element: any) => {
      if (element.type === 'bpmn:ServiceTask') {
        const bo = element.businessObject;
        if (!bo.get('camunda:implementation')) {
          this.validationErrors.push({
            id: element.id,
            message: `Service task "${bo.name || element.id}" is missing implementation`
          });
        }
      } else if (element.type === 'bpmn:EndEvent') {
        // Check if all end events have incoming connections
        if (!element.incoming || element.incoming.length === 0) {
          this.validationErrors.push({
            id: element.id,
            message: 'End event has no incoming flow'
          });
        }
      }
    });
  }

  // Deploy process to Camunda Engine
  public async deployProcess(): Promise<void> {
    try {
      this.isLoading = true;
      this.showDeployModal = false;
      
      const xml = await this.exportDiagram();
      
      const result = await this.processService.deployProcessWithOptions(xml, {
        deploymentName: this.deploymentConfig.name || this.deploymentConfig.processId,
        processId: this.deploymentConfig.processId,
        tenantId: this.deploymentConfig.tenantId,
        enableDuplicateFiltering: this.deploymentConfig.duplicateFiltering,
        deployChangedOnly: this.deploymentConfig.deployChangedOnly
      });
      
      this.isLoading = false;
      
      // Store deployment result
      this.lastDeploymentResult = {
        id: result.id,
        name: result.name,
        deploymentTime: result.deploymentTime,
        version: result.version || 1,
        processDefinitionId: result.deployedProcessDefinition?.id || ''
      };
      
      this.loadDeployments();
      this.showDeploymentSuccessModal = true;
      this.deployed.emit(result);
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  // Close deployment success modal
  public closeDeploymentSuccessModal(): void {
    this.showDeploymentSuccessModal = false;
  }

  // Load available deployments
  public async loadDeployments(): Promise<void> {
    try {
      const deployments = await this.processService.getDeployedProcesses().toPromise();
      this.deployments = deployments || [];
    } catch (err) {
      this.handleError(err);
    }
  }

  // Open start instance modal
  public async openStartInstanceModal(): Promise<void> {
    this.showDeploymentSuccessModal = false;
    
    try {
      await this.loadDeployments();
      
      this.startInstanceConfig = {
        processDefinitionId: this.deployments.length ? this.deployments[0].id : '',
        businessKey: '',
        variables: []
      };
      
      // Pre-fill with process variables if available
      if (this.processVariables.length > 0) {
        this.startInstanceConfig.variables = this.processVariables.map(pv => ({
          name: pv.name,
          type: pv.type,
          value: pv.defaultValue || ''
        }));
      }
      
      this.showStartInstanceModal = true;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Close start instance modal
  public closeStartInstanceModal(): void {
    this.showStartInstanceModal = false;
  }

  // When a process definition is selected
  public onProcessDefinitionSelected(): void {
    // You could load process-specific information here if needed
  }

  // Add variable for process start
  public addStartVariable(): void {
    this.startInstanceConfig.variables.push({
      name: '',
      type: 'string',
      value: ''
    });
  }

  // Remove variable for process start
  public removeStartVariable(index: number): void {
    this.startInstanceConfig.variables.splice(index, 1);
  }

  // Convert variables to the format expected by Camunda engine
  private prepareVariablesForStart(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.startInstanceConfig.variables.forEach(variable => {
      if (!variable.name.trim()) return;
      
      let value: any = variable.value;
      
      switch (variable.type) {
        case 'integer':
          value = parseInt(value);
          break;
        case 'boolean':
          value = value.toLowerCase() === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Invalid JSON for variable ${variable.name}:`, e);
          }
          break;
        case 'date':
          if (value) {
            try {
              value = new Date(value).toISOString();
            } catch (e) {
              console.warn(`Invalid date for variable ${variable.name}:`, e);
            }
          }
          break;
      }
      
      result[variable.name] = value;
    });
    
    return result;
  }

  // Start a process instance
  public async startProcessInstance(): Promise<void> {
    if (!this.startInstanceConfig.processDefinitionId) {
      this.handleError(new Error('No process definition selected'));
      return;
    }
    
    try {
      this.isLoading = true;
      this.showStartInstanceModal = false;
      
      const variables = this.prepareVariablesForStart();
      
      const result = await this.processService.startProcess(
        this.startInstanceConfig.processDefinitionId,
        this.startInstanceConfig.businessKey,
        variables
      ).toPromise();
      
      this.lastInstanceResult = {
        id: result.id,
        definitionId: result.definitionId,
        businessKey: result.businessKey
      };
      
      this.isLoading = false;
      this.showInstanceStartedModal = true;
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  // Close instance started modal
  public closeInstanceStartedModal(): void {
    this.showInstanceStartedModal = false;
  }

  // Get process ID from current diagram
  private getProcessIdFromDiagram(): string {
    try {
      const canvas = this.bpmnJS.get('canvas');
      const rootElement = canvas.getRootElement();
      if (rootElement && rootElement.businessObject) {
        return rootElement.businessObject.id || '';
      }
      return '';
    } catch (err) {
      console.error('Error getting process ID:', err);
      return '';
    }
  }

  // Open deployment modal
  public openDeployModal(): void {
    this.validateDiagram();
    
    if (this.validationErrors.length > 0) {
      this.handleError(new Error('Please fix validation errors before deploying'));
      return;
    }
    
    this.deploymentConfig = {
      name: '',
      processId: this.getProcessIdFromDiagram(),
      tenantId: '',
      duplicateFiltering: true,
      deployChangedOnly: false
    };
    
    this.showDeployModal = true;
  }

  // Close deployment modal
  public closeDeployModal(): void {
    this.showDeployModal = false;
  }

  // Import BPMN diagram
  public importDiagram(xml: string): Observable<{ warnings: Array<any> }> {
    return from(this.bpmnJS.importXML(xml) as Promise<{ warnings: Array<any> }>);
  }

  // Export diagram as XML
  public async exportDiagram(): Promise<string> {
    try {
      const result = await this.bpmnJS.saveXML({ format: true });
      return result.xml;
    } catch (err) {
      this.handleError(err);
      return '';
    }
  }

  // Save the current diagram
  public async saveDiagram(): Promise<void> {
    if (!this.saveEnabled) return;
    
    try {
      this.isLoading = true;
      const xml = await this.exportDiagram();
      await this.diagramService.saveDiagram(xml);
      this.saveEnabled = false;
      this.isLoading = false;
    } catch (err) {
      this.isLoading = false;
      this.handleError(err);
    }
  }

  // Download the diagram as BPMN XML file
  public async downloadDiagram(): Promise<void> {
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

  // Load a new diagram
  public loadNewDiagram(xml: string): void {
    if (!xml) return;
    
    this.isLoading = true;
    this.importDiagram(xml).pipe(
      take(1),
      catchError(err => {
        this.handleError(err);
        return [];
      })
    ).subscribe(() => {
      this.isLoading = false;
    });
  }
  
  // Handle errors in the component
  private handleError(err: any): void {
    this.errorHandler.next(err instanceof Error ? err : new Error(err));
    this.importError.emit(err);
    console.error('BPMN Modeler Error:', err);
  }

  // Zoom controls
  public zoomIn(): void {
    const canvas = this.bpmnJS.get('canvas');
    canvas.zoom(canvas.zoom() + 0.1);
  }

  public zoomOut(): void {
    const canvas = this.bpmnJS.get('canvas');
    canvas.zoom(canvas.zoom() - 0.1);
  }

  public resetZoom(): void {
    const canvas = this.bpmnJS.get('canvas');
    canvas.zoom('fit-viewport');
  }

  /**
   * Start the token simulation for the current process model
   */
  public simulateProcess(): void {
    const tokenSimulation = this.bpmnJS.get('tokenSimulation');
    if (tokenSimulation) {
      tokenSimulation.toggleMode();
    } else {
      console.warn('Token simulation module not available');
      // Create a user-friendly error if needed
      const error = new Error('Token simulation is not available. Ensure the token-simulation module is properly loaded.');
      this.handleError(error);
    }
  }
}