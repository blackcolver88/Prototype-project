import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTemplateCreateComponent } from './form-template-create.component';

describe('FormTemplateCreateComponent', () => {
  let component: FormTemplateCreateComponent;
  let fixture: ComponentFixture<FormTemplateCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTemplateCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTemplateCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
