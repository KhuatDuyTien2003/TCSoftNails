import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGoodsReceiptComponent } from './add-goods-receipt.component';

describe('AddGoodsReceiptComponent', () => {
  let component: AddGoodsReceiptComponent;
  let fixture: ComponentFixture<AddGoodsReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddGoodsReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGoodsReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
