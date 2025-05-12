import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRankComponent } from './customer-rank.component';

describe('CustomerRankComponent', () => {
  let component: CustomerRankComponent;
  let fixture: ComponentFixture<CustomerRankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerRankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
