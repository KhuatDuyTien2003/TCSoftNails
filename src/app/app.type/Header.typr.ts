export interface Header {
  id: string;
  name: string;
  url: string;
  parentId: string;
  sortOrder: number | null;
  cssClass: string | null;
  isMenu: boolean;
  status: boolean;
  isAdmin: boolean;
}