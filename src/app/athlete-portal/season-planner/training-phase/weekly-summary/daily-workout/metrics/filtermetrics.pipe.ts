import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtermetrics'
})
export class FiltermetricsPipe implements PipeTransform {
  transform(metrics: any, selectedMetrics: any, filterType: string): any {
    const a = new Array();
    if (filterType === 'All' ) {
      return metrics;
    }

    if (filterType === 'SelectedMetrics' ) {
      for (let i = 0; i < metrics.length; i++) {
        const id = metrics[i].metricId;
        if (selectedMetrics && selectedMetrics.trackList && selectedMetrics.trackList.includes(id)) {
          a.push(metrics[i]);
        }
      }
      return a;
    }

    if (filterType === 'Favourites' ) {
      for (let i = 0 ; i < metrics.length; i++) {
        const id = metrics[i].metricId;
        if (selectedMetrics && selectedMetrics.displayList && selectedMetrics.displayList.includes(id) ) {
          a.push(metrics[i]);
        }
      }
      return a;
    }
  }
}
