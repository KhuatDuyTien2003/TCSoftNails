import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dropdown } from '../../app.type/SelectParentChild.type';

@Component({
  selector: 'app-sub-menu',
  standalone: true,
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss',
  imports: [CommonModule],
})
export class SubMenuComponent {
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
