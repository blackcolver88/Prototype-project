import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextformConfigComponent } from './textform-config.component';

describe('TextformConfigComponent', () => {
  let component: TextformConfigComponent;
  let fixture: ComponentFixture<TextformConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextformConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextformConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
