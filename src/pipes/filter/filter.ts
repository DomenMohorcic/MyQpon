import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: Object) {
    if (!items || !filter) return items;

    const filterKey = Object.keys(filter)[0];
    if (!filterKey) return items;

    if (typeof filter[filterKey] === 'boolean') {
      return items.filter(item => item[filterKey] === filter[filterKey]);
    } else {
      return items.filter(item => item[filterKey].indexOf(filter[filterKey]) !== -1);
    }
  }
}
