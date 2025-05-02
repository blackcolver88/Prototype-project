import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessesPageComponent } from './processes-page.component';

describe('ProcessesPageComponent', () => {
  let component: ProcessesPageComponent;
  let fixture: ComponentFixture<ProcessesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
