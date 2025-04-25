import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComboDialogComponent } from './add-combo-dialog.component';

describe('AddComboDialogComponent', () => {
  let component: AddComboDialogComponent;
  let fixture: ComponentFixture<AddComboDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddComboDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddComboDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
