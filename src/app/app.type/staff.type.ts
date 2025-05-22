export interface Staff {
  staffId: number;
  staffName: string;
  gender?: boolean | null;
  numberPhone?: string | null;
  email?: string | null;
  birthday?: Date | string | null;
  urlAvatar?: string | null;
  totalStar?: number | null;
  joinDate?: Date | string | null;
  isDeleted: boolean;
  status: boolean;
}
