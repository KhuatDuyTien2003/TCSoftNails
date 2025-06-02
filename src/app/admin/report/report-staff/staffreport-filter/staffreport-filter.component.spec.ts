import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffreportFilterComponent } from './staffreport-filter.component';

describe('StaffreportFilterComponent', () => {
  let component: StaffreportFilterComponent;
  let fixture: ComponentFixture<StaffreportFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffreportFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffreportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
