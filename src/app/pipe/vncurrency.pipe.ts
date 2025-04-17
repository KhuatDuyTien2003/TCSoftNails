import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vncurrency',
  standalone: true,
})
export class VncurrencyPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return '0 ₫';
    return value.toLocaleString('vi-VN') + ' ₫';
  }
}
