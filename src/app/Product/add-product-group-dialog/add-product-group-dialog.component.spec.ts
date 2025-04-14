import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductGroupDialogComponent } from './add-product-group-dialog.component';

describe('AddProductGroupDialogComponent', () => {
  let component: AddProductGroupDialogComponent;
  let fixture: ComponentFixture<AddProductGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProductGroupDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
