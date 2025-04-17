export interface Appointment {
  idStaff: number;
  staffName: string;
  appointmentCustomer: AppointmentCustomerModel[];
}

export interface AppointmentCustomerModel {
  idAppointment: number;
  idCustomer: number;
  customerName: string;
  email: string;
  gender: boolean;
  status: boolean;
  numberPhone: string;
  timeStart: Date;
  timeEnd: Date;
  description: string;
  appointmentDetails: AppointmentDetailModel[];
}

export interface AppointmentDetailModel {
  idService: number;
  proAndSerName: string;
  workTime: number;
  sellingPrice: number;
}
