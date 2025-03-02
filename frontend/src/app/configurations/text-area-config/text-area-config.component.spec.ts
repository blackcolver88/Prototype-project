import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAreaConfigComponent } from './text-area-config.component';

describe('TextAreaConfigComponent', () => {
  let component: TextAreaConfigComponent;
  let fixture: ComponentFixture<TextAreaConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextAreaConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextAreaConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
