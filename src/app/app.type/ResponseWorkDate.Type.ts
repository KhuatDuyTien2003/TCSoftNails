import { WorkDate } from './WorkDate.type';
export interface ResponseWorkDate {
  staffId: number;
  staffName: string;
  workSchedule: WorkScheduleModel[];
}

export interface WorkScheduleModel {

workScheduleId
?: number;
  customerId?: number;
  customerName?: string;
  shift?: number;
  workDate?: Date;
  isDone?: boolean;
}
