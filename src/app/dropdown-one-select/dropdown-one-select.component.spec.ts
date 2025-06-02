import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownOneSelectComponent } from './dropdown-one-select.component';

describe('DropdownOneSelectComponent', () => {
  let component: DropdownOneSelectComponent;
  let fixture: ComponentFixture<DropdownOneSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownOneSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownOneSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
