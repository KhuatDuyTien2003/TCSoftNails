import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownParentChildComponent } from './dropdown-parent-child.component';

describe('DropdownParentChildComponent', () => {
  let component: DropdownParentChildComponent;
  let fixture: ComponentFixture<DropdownParentChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownParentChildComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownParentChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
