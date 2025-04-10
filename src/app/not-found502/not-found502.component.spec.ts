import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFound502Component } from './not-found502.component';

describe('NotFound502Component', () => {
  let component: NotFound502Component;
  let fixture: ComponentFixture<NotFound502Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFound502Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFound502Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
