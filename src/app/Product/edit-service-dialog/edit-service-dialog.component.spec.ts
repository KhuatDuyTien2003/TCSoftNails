import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServiceDialogComponent } from './edit-service-dialog.component';

describe('EditServiceDialogComponent', () => {
  let component: EditServiceDialogComponent;
  let fixture: ComponentFixture<EditServiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditServiceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditServiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
