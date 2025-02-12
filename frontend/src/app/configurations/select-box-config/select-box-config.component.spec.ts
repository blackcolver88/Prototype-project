import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBoxConfigComponent } from './select-box-config.component';

describe('SelectBoxConfigComponent', () => {
  let component: SelectBoxConfigComponent;
  let fixture: ComponentFixture<SelectBoxConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBoxConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectBoxConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
