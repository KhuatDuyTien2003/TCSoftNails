import { DoanhThuTheoNgay } from './DoanhThuTheoNgay.type';
import { MonthlyReport } from './MonthlyReport.type';

export interface ReportResponseModel {
  doanhThuTheoNgays: DoanhThuTheoNgay[];
  monthlyReports: MonthlyReport[];
}
