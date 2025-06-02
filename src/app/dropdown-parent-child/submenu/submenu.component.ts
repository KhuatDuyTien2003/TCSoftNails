import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dropdown } from '../../app.type/SelectParentChild.type';

@Component({
  selector: 'app-submenu',
  standalone: true,
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.scss'],
  imports: [CommonModule], // Xóa SubmenuComponent khỏi imports
})
export class SubmenuComponent {
  @Input() items: Dropdown[] = [];

  @Input() menu: Dropdown[] = [];
  @Input() selectedMenu: Dropdown[] = [];
  @Output() id = new EventEmitter<number>();
  getChildList(id: number): Dropdown[] {
    return this.menu.filter((item) => item.parentId === id);
  }
  sendId(id: number) {
    console.log(id);
    this.id.emit(id);
  }
  checkClass(id: number): boolean {
    const value = this.selectedMenu.find((m) => m.id === id);
    if (value) {
      return true;
    }
    return false;
  }
}
