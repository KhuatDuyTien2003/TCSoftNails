import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarStaffComponent } from './calendar-staff.component';

describe('CalendarStaffComponent', () => {
  let component: CalendarStaffComponent;
  let fixture: ComponentFixture<CalendarStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
