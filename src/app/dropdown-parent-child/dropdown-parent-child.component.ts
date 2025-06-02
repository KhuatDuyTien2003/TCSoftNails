import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Dropdown } from '../app.type/SelectParentChild.type';
import { SubmenuComponent } from './submenu/submenu.component';

@Component({
  selector: 'app-dropdown-parent-child',
  standalone: true,
  templateUrl: './dropdown-parent-child.component.html',
  styleUrl: './dropdown-parent-child.component.scss',
  imports: [
    FormsModule,
    NzSelectModule,
    NzRadioModule,
    CommonModule,
    SubmenuComponent,
  ],
})
export class DropdownParentChildComponent<T extends Dropdown>
  implements OnInit, OnChanges
{
  searchValue: string = '';
  selectedMenu: T[] = [];
  @Input() menuReponse: T[] = [];
  @Output() selectionChanged = new EventEmitter<T[]>();

  menu: T[] = [];
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuReponse'] && this.menuReponse?.length > 0) {
      this.menu = this.menuReponse;
      console.log('2', this.menuReponse);
      const hasLoop = this.checkForCyclicParent(this.menu);
      if (hasLoop) {
        console.error('❌ Có vòng lặp trong dữ liệu menu!');
      } else {
        console.log('✅ Menu hợp lệ, không có vòng lặp.');
      }
    }
  }

  checkForCyclicParent(menu: T[]): Boolean {
    const map = new Map<number, number | null>();
    menu.forEach((item) => map.set(item.id, item.parentId));
    for (let i of menu) {
      if (this.checkCycle(i.id, new Set(), map)) {
        return true;
      }
    }
    return false;
  }

  checkCycle(
    id: number,
    path: Set<number>,
    map: Map<number, number | null>
  ): boolean {
    if (path.has(id)) return true; // Phát hiện vòng lặp

    const parentId = map.get(id);
    if (parentId === null || parentId === undefined) return false;

    path.add(id);
    const result = this.checkCycle(parentId, path, map);
    path.delete(id);
    return result;
  }

  getChildList(id: number): Dropdown[] {
    return this.menu.filter((item) => item.parentId === id);
  }

  isClickInsideDropdown = false;

  showDropdown() {
    this.isClickInsideDropdown = true;
  }

  setForcus() {
    this.isClickInsideDropdown = true;
  }
  selectItem(id: number) {
    const value = this.menu.find((m) => m.id === id);
    if (value) {
      const exists = this.selectedMenu.find((s) => s.id === value.id);
      if (!exists) {
        this.selectedMenu.push(value);
        this.selectionChanged.emit(this.selectedMenu);
      } else {
        this.selectedMenu = this.selectedMenu.filter((s) => s.id !== value.id);
        this.selectionChanged.emit(this.selectedMenu);
      }
    }
  }
  selectItemFromChild(id: number) {
    console.log('hihi');
    const value = this.menu.find((m) => m.id === id);
    if (value) {
      const exists = this.selectedMenu.find((s) => s.id === value.id);
      if (!exists) {
        this.selectedMenu.push(value);
        this.selectionChanged.emit(this.selectedMenu);
      } else {
        this.selectedMenu = this.selectedMenu.filter((s) => s.id !== value.id);
        this.selectionChanged.emit(this.selectedMenu);
      }
    }
  }

  checkClass(id: number): boolean {
    const value = this.selectedMenu.find((m) => m.id === id);
    if (value) {
      return true;
    }
    return false;
  }
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      // Nếu không click vào dropdownRef thì thực hiện ở đây
      this.isClickInsideDropdown = false;
    } else {
      this.isClickInsideDropdown = true;
    }
  }

  waitSearch(name: string) {
    setTimeout(() => this.search(name), 300);
  }

  search(name: string) {
    this.menu = [];
    let items: T[] = this.menuReponse.filter((m) => m.name.includes(name));
    for (let i of items) {
      this.menu.push(i);
      this.searchId(i.parentId ?? 0.0001);
    }
    console.log(this.menu);
  }

  searchId(id: number) {
    let item = this.menuReponse.find((m) => m.id === id);
    if (item && !this.menu.find((m) => m.id === item.id)) {
      this.menu.push(item);
      this.searchId(item.parentId ?? 0.000001);
    }
  }
}
