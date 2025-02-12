import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextformComponent } from './textform.component';

describe('TextformComponent', () => {
  let component: TextformComponent;
  let fixture: ComponentFixture<TextformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
