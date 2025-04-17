export interface AppointmentSent {
  idStaff: number;
  numberPhone: string;
  customerName: string;
  email: string;
  gender: boolean;
  description: string;
  startTime: Date;
  endTime: Date;
  listOfSevice: number[];
}
