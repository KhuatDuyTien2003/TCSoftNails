export interface Appointment {
  id: number;
  idStaff: number;
  staffName: string;
  appointmentCustomer: AppointmentCustomerModel[];
}

export interface AppointmentCustomerModel {
  idCustomer: number;
  customerName: string;
  email: string;
  numberPhone: string;
  timeStart: Date;
  timeEnd: Date;
  note: string;
  appointmentDetails: AppointmentDetailModel[];
}

export interface AppointmentDetailModel {
  idService: number;
  proAndSerName: string;
  workTime: number;
  sellingPrice: number;
}
