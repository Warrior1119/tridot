import { Component, OnInit } from '@angular/core';
import { session, beans } from '../constants/data'

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  single: any[];
  multi: any[];

  view: any[] = [700, 200];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Power';

  colorScheme = {
    domain: ['#9e93ef', '#a5b4f5', '#eea5f4', '#88c1ba','#b6f7c1']
  };

  // line, area
  autoScale = true;

  constructor() {
   // Object.assign(this, { single, multi })

   this.createGraph(beans)
  }

  createGraph(res) {
    let single = []
    let multi = []
    res[0].laps.forEach((lap, idx, arr) => {
      let title = {
        name: "Lap " + (idx + 1),
        value: lap.avgSpeed
      }
      single.push(title);

      let multiPoint = {
        name: "Lap " + (idx + 1),
        series: []
      };

      lap.tracks[0].trackPoints.forEach((point,idx,arr) => {
        let pointObj = {
          name: new Date(point.dateTime),
          value: point.speed
        }
        multiPoint.series.push(pointObj);

        if (idx == arr.length - 1) {
          multi.push(multiPoint)
        }
      });

      if (idx == arr.length - 1) {
        console.log(single,multi);
        Object.assign(this, { single, multi })
      }

    });
  }

  onSelect(event) {
    console.log(event);
  }

  ngOnInit() {
    console.log(session)
    console.log(beans)
  }

}
