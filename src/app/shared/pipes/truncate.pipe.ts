import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength = 15): string {
    if (!value) return '';
    if (value.length > maxLength) {
      return value.substring(0, maxLength) + '';
    }
    return value;
  }
}

