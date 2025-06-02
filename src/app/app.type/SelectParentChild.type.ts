export interface Dropdown {
  id: number;
  parentId: number | null;
  name: string;

}
export interface CategoryDropdown extends Dropdown {
  icon?: string;
  description?: string;
}
