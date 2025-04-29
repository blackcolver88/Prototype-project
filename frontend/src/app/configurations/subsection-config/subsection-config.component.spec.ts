import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsectionConfigComponent } from './subsection-config.component';

describe('SubsectionConfigComponent', () => {
  let component: SubsectionConfigComponent;
  let fixture: ComponentFixture<SubsectionConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsectionConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsectionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
