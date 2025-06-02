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
import { SubmenuComponent } from '../dropdown-parent-child/submenu/submenu.component';
import { CommonModule } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { Dropdown } from '../app.type/SelectParentChild.type';
import { SubMenuComponent } from "./sub-menu/sub-menu.component";

@Component({
  selector: 'app-dropdown-one-select',
  standalone: true,
  templateUrl: './dropdown-one-select.component.html',
  styleUrl: './dropdown-one-select.component.scss',
  imports: [
    FormsModule,
    NzSelectModule,
    NzRadioModule,
    CommonModule,
    SubmenuComponent,
    SubMenuComponent
],
})
export class DropdownOneSelectComponent<T extends Dropdown>
  implements OnInit, OnChanges
{
  searchValue: string = '';
  selectedItem: T | null = null;

  @Input() menuReponse: T[] = [];
  @Output() selectionChanged = new EventEmitter<T | null>();

  menu: T[] = [];

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  isClickInsideDropdown = false;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuReponse'] && this.menuReponse?.length > 0) {
      this.menu = this.menuReponse;
      const hasLoop = this.checkForCyclicParent(this.menu);
      if (hasLoop) {
        console.error('❌ Có vòng lặp trong dữ liệu menu!');
      } else {
        console.log('✅ Menu hợp lệ, không có vòng lặp.');
      }
    }
  }

  checkForCyclicParent(menu: T[]): boolean {
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
    if (path.has(id)) return true;

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.isClickInsideDropdown = false;
    } else {
      this.isClickInsideDropdown = true;
    }
  }

  showDropdown() {
    this.isClickInsideDropdown = true;
  }

  setFocus() {
    this.isClickInsideDropdown = true;
  }

  selectItem(id: number) {
    const value = this.menu.find((m) => m.id === id);
    if (!value) return;

    if (this.selectedItem?.id === id) {
      this.selectedItem = null;
    } else {
      this.selectedItem = value;
    }

    this.selectionChanged.emit(this.selectedItem);
  }

  selectItemFromChild(id: number) {
    const value = this.menu.find((m) => m.id === id);
    if (!value) return;

    if (this.selectedItem?.id === id) {
      this.selectedItem = null;
    } else {
      this.selectedItem = value;
    }

    this.selectionChanged.emit(this.selectedItem);
  }

  isSelected(id: number): boolean {
    return this.selectedItem?.id === id;
  }

  removeSelectedItem() {
    this.selectedItem = null;
    this.selectionChanged.emit(null);
  }

  waitSearch(name: string) {
    setTimeout(() => this.search(name), 300);
  }

  search(name: string) {
    this.menu = [];
    const items = this.menuReponse.filter((m) => m.name.includes(name));
    for (let i of items) {
      this.menu.push(i);
      this.searchId(i.parentId ?? 0.0001);
    }
  }

  searchId(id: number) {
    const item = this.menuReponse.find((m) => m.id === id);
    if (item && !this.menu.find((m) => m.id === item.id)) {
      this.menu.push(item);
      this.searchId(item.parentId ?? 0.000001);
    }
  }
}
