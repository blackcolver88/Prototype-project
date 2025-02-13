import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordConfigComponent } from './password-config.component';

describe('PasswordConfigComponent', () => {
  let component: PasswordConfigComponent;
  let fixture: ComponentFixture<PasswordConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
