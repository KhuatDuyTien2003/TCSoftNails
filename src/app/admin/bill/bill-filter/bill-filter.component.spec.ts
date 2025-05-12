import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillFilterComponent } from './bill-filter.component';

describe('BillFilterComponent', () => {
  let component: BillFilterComponent;
  let fixture: ComponentFixture<BillFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
