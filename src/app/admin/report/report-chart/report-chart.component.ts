import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-report-chart',
  standalone: true,
  templateUrl: './report-chart.component.html',
  styleUrl: './report-chart.component.scss',
  imports: [CommonModule, NgxChartsModule],
})
export class ReportChartComponent {
  @Input() chartName: string = 'hihihi';
  groupedData = [
    {
      name: '1/5/2025',
      series: [
        { name: 'Sản phẩm A', value: 600000 },
        { name: 'Sản phẩm B', value: 1110 },
      ],
    },
    {
      name: '2/5/2025',
      series: [
        { name: 'Sản phẩm A', value: 2220 },
        { name: 'Sản phẩm B', value: 600000 },
      ],
    },
  ];

  baseColors = [
    '#5AA454',
    '#A10A28',
    '#C7B42C',
    '#AAAAAA',
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#33FFF6',
    '#F6FF33',
    '#FF8633',
    '#33FF86',
  ];

  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: this.shuffleArray(this.baseColors),
  };

  shuffleArray(array: string[]): string[] {
    const result = array.slice(); // copy mảng gốc
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
