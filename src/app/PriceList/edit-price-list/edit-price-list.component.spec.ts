import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPriceListComponent } from './edit-price-list.component';

describe('EditPriceListComponent', () => {
  let component: EditPriceListComponent;
  let fixture: ComponentFixture<EditPriceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPriceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
