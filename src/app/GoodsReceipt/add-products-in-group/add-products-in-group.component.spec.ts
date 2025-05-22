import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductsInGroupComponent } from './add-products-in-group.component';

describe('AddProductsInGroupComponent', () => {
  let component: AddProductsInGroupComponent;
  let fixture: ComponentFixture<AddProductsInGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProductsInGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductsInGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
