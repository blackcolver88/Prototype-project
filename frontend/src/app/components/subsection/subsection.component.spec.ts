import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsectionComponent } from './subsection.component';

describe('SubsectionComponent', () => {
  let component: SubsectionComponent;
  let fixture: ComponentFixture<SubsectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
