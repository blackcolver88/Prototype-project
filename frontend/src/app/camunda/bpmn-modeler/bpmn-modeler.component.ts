import { Component, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-bpmn-modeler',
  templateUrl: './bpmn-modeler.component.html',
  styleUrl: './bpmn-modeler.component.css'
})
export class BpmnModelerComponent {
  private bpmnJS: any;
  @ViewChild('bpmnModelerRef', { static: true }) private bpmnModelerRef: ElementRef | undefined;
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
  </bpmn:definitions>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_02r90y2" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.24.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.21.0">
        <bpmn:process id="Process_1s5zn7v" isExecutable="true" camunda:historyTimeToLive="10">
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:outgoing>Flow_1e64c8b</bpmn:outgoing>
          </bpmn:startEvent>
          <bpmn:endEvent id="Event_0rzkx5b">
            <bpmn:incoming>Flow_1b80get</bpmn:incoming>
          </bpmn:endEvent>
          <bpmn:sequenceFlow id="Flow_1e64c8b" sourceRef="StartEvent_1" targetRef="Activity_1jlibrg" />
          <bpmn:sequenceFlow id="Flow_1b80get" sourceRef="Activity_1jlibrg" targetRef="Event_0rzkx5b" />
          <bpmn:userTask id="Activity_1jlibrg" name="A user task here">
            <bpmn:incoming>Flow_1e64c8b</bpmn:incoming>
            <bpmn:outgoing>Flow_1b80get</bpmn:outgoing>
          </bpmn:userTask>
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s5zn7v">
            <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
              <dc:Bounds x="179" y="102" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Event_0rzkx5b_di" bpmnElement="Event_0rzkx5b">
              <dc:Bounds x="812" y="102" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_0h5dmju_di" bpmnElement="Activity_1jlibrg">
              <dc:Bounds x="390" y="80" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="Flow_1e64c8b_di" bpmnElement="Flow_1e64c8b">
              <di:waypoint x="215" y="120" />
              <di:waypoint x="390" y="120" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_1b80get_di" bpmnElement="Flow_1b80get">
              <di:waypoint x="490" y="120" />
              <di:waypoint x="812" y="120" />
            </bpmndi:BPMNEdge>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>
      `;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterContentInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Import dynamically to avoid SSR issues
      import('bpmn-js/lib/Modeler').then(({ default: Modeler }) => {
        import('bpmn-js-token-simulation').then(({ default: TokenSimulationModule }) => {
          this.bpmnJS = new Modeler({
            container: this.bpmnModelerRef?.nativeElement,
            additionalModules: [TokenSimulationModule]
          });
          
          this.bpmnJS.attachTo(this.bpmnModelerRef!.nativeElement);
          this.importDiagram(this.xml);
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.bpmnJS) {
      this.bpmnJS.destroy();
    }
  }

  private importDiagram(xml: string): Observable<{warnings: Array<any>}> {
    return from(this.bpmnJS.importXML(xml) as Promise<{warnings: Array<any>}>);
  }
}