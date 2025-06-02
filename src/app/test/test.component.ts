import { Component, OnInit } from '@angular/core';
import { Header } from '../app.type/Header.typr';
import { HttpHeaderService } from '../services/http-header.service';
import { CommonModule } from '@angular/common';
import { DropdownParentChildComponent } from '../dropdown-parent-child/dropdown-parent-child.component';
import { CategoryDropdown, Dropdown } from '../app.type/SelectParentChild.type';
import { DropdownOneSelectComponent } from '../dropdown-one-select/dropdown-one-select.component';

@Component({
  selector: 'app-test',
  standalone: true,
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
  imports: [
    CommonModule,
    DropdownParentChildComponent,
    DropdownOneSelectComponent,
  ],
})
export class TestComponent implements OnInit {
  CATEGORY_DROPDOWN_DATA: CategoryDropdown[] = [
    {
      id: 1,
      parentId: null,
      name: 'Clothing',
      icon: 'shirt',
      description: 'All kinds of clothing',
    },
    {
      id: 2,
      parentId: 1,
      name: 'Men',
      icon: 'male',
      description: 'Men clothing',
    },
    {
      id: 3,
      parentId: 1,
      name: 'Women',
      icon: 'female',
      description: 'Women clothing',
    },
    {
      id: 4,
      parentId: 2,
      name: 'T-Shirts',
      icon: 'tshirt',
      description: 'T-shirts for men',
    },
    {
      id: 5,
      parentId: 2,
      name: 'Jeans',
      icon: 'jeans',
      description: 'Jeans for men',
    },
    {
      id: 6,
      parentId: 3,
      name: 'Dresses',
      icon: 'dress',
      description: 'Dresses for women',
    },
    {
      id: 7,
      parentId: null,
      name: 'Accessories',
      icon: 'watch',
      description: 'Fashion accessories',
    },
    {
      id: 8,
      parentId: 7,
      name: 'Watches',
      icon: 'clock',
      description: 'All kinds of watches',
    },
  ];
  input: Dropdown[] = [];
  input2: CategoryDropdown | null = null;
  constructor(private httpH: HttpHeaderService) {}
  getHeader() {}
  ngOnInit(): void {
    this.getHeader();
  }
  list: CategoryDropdown[] = [];
  getEmit(l: CategoryDropdown[]) {
    this.list = l;
    console.log(this.list);
  }
  getEmit1(l: CategoryDropdown | null) {
    this.input2 = l;
    console.log(this.list);
  }
}
