import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDoanhthuComponent } from './report-doanhthu.component';

describe('ReportDoanhthuComponent', () => {
  let component: ReportDoanhthuComponent;
  let fixture: ComponentFixture<ReportDoanhthuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDoanhthuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDoanhthuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
