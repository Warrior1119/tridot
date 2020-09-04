import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
import { DecimalPipe } from '@angular/common';
import { KM_TO_MI_MULT, M_TO_YD_MULT, M_TO_FT_MULT } from '../../constants/constants';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-chart-wrapper',
  templateUrl: './chart-wrapper.component.html',
  styleUrls: ['./chart-wrapper.component.scss']
})
export class ChartWrapperComponent implements OnInit {
  @ViewChild(BaseChartDirective) private _chartRef: BaseChartDirective;

  @Input() chartType: string;
  @Input() measurementSystem: string;
  @Input() sessionType: string;
  @Input() trackpoints;

  // chart options
  public baseMetricsX = [];
  public baseMetricsY = ['Over Time', 'Over Distance'];
  public selBaseMetricY: string;
  public selBaseMetricX: string;
  public overlays = [];
  public selOverlays = [];

  // default chart setup
  public chartColors: Color[] = [
    { // 0: Heart Rate
      ...this._buildColor('rgba(255,0,0,0.5)')
    },
    { // 1: Pace
      ...this._buildColor('rgba(238,98,250,0.5)')
    },
    { // 2: Power
      ...this._buildColor('rgba(59, 185, 51, 0.5)')
    },
    { // 3: Speed
      ...this._buildColor('rgba(0,0,255,0.5)')
    },
    { // 4: Cadence
      ...this._buildColor('rgba(238, 110, 68,0.5)')
    },
    { // 5: Elevation
      ...this._buildColor('rgba(100, 0, 255, 0.5)')
    },
    { // 6: Temperature
      ...this._buildColor('rgba(0, 180, 234, 0.5)')
    }
  ];
  public chartData: ChartDataSets[] = [
    { data: [], lineTension: 0, label: 'Heart Rate', yAxisID: 'heartRateAxis' },
    { data: [], lineTension: 0, label: 'Pace', yAxisID: 'paceAxis' },
    { data: [], lineTension: 0, label: 'Power', yAxisID: 'powerAxis' },
    { data: [], lineTension: 0, label: 'Speed', yAxisID: 'speedAxis' },
    { data: [], lineTension: 0, label: 'Cadence', yAxisID: 'cadenceAxis' },
    { data: [], lineTension: 0, label: 'Elevation', yAxisID: 'elevationAxis' },
    { data: [], lineTension: 0, label: 'Temperature', yAxisID: 'tempAxis' }
  ];
  public chartLabels = [];
  public chartLegend = false;
  public chartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          display: false
        },
        ticks: {
          padding: 7,
          fontSize: 12
        }
      }],
      yAxes: [{
        id: 'heartRateAxis',
        position: 'left',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Heart Rate') > -1
              ? this._getOverlayLabel('heartRateAxis', label, index, labels)
              : label;
          }
        },
      },
      {
        id: 'paceAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Pace') > -1
              ? this._getOverlayLabel('paceAxis', label, index, labels)
              : label;
          }
        },
      },
      {
        id: 'powerAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Power') > -1
              ? this._getOverlayLabel('powerAxis', label, index, labels)
              : label;
          }
        },
      },
      {
        id: 'speedAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Speed') > -1
              ? this._getOverlayLabel('speedAxis', label, index, labels)
              : label;
          }
        },
      },
      {
        id: 'cadenceAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Cadence') > -1
              ? this._getOverlayLabel('cadenceAxis', label, index, labels)
              : label;
          }
        },
      },
      {
        id: 'elevationAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Elevation') > -1
            ? this._getOverlayLabel('elevationAxis', label, index, labels)
            : label;
          }
        },
      },
      {
        id: 'tempAxis',
        position: 'right',
        display: false,
        gridLines: {
          display: false
        },
        ticks: {
          callback: (label, index, labels) => {
            return this.selOverlays.indexOf('Temperature') > -1
              ? this._getOverlayLabel('tempAxis', label, index, labels)
              : label;
          }
        },
      }
      ]
    },
    tooltips: {
      enabled: false
    }
  };
  public chartPlugins = [];

  // view logic
  public maximized = false;
  public metricIndicies = {
    'Heart Rate': 0,
    'Pace': 1,
    'Power': 2,
    'Speed': 3,
    'Cadence': 4,
    'Elevation': 5,
    'Temperature': 6
  }
  public modalRef: BsModalRef;

  // decrease to display more data points
  private _averageModulus = 10;
  private _minMetricX = 0;
  private _maxMetricX = 0;
  private _unscaledTrackpoints = {};

  constructor(private decimalPipe: DecimalPipe,
    private modalService: BsModalService) { }

  ngOnInit() {
    // TODO: fetch any of the users chart layout preferences
    this._buildBaseMetricControls();
    this._buildOverlayControls();
    this._setChartData();

    this.modalService.onHide.subscribe(() => this.maximized = false);
    this.modalService.onShown.subscribe(() => this.maximized = true);
  }

  public getMetricColor(metric) {
    if (this.chartColors && this.metricIndicies) {
      return this.chartColors[this.metricIndicies[metric]].backgroundColor;
    }
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-xl' })
    );
  }

  public selectBaseMetricY(metric) {
    // hide all existing y axes
    this.chartOptions.scales.yAxes.forEach(x => {
      x.display = false;
    });

    this.selBaseMetricY = metric;
    this._setBaseMetricY();
  }

  public selectBaseMetricX(metric) {
    this.selBaseMetricX = metric;
    this._setBaseMetricX();
  }

  public toggleOverlay(overlay: string) {
    if (this.selOverlays.indexOf(overlay) > -1) {
      this._removeOverlay(overlay);
    } else {
      this._addOverlay(overlay);
    }
  }

  // #region Private methods

  private _addOverlay(overlay: string) {
    let lastPoint = null;
    let data = [];
    this.trackpoints.forEach(x => {
      if (this.trackpoints.indexOf(x) % this._averageModulus === 0) {
        const value = this._getMetricValue(overlay, x, lastPoint);
        lastPoint = x;
        data.push(+(value.toFixed(2)));
      }
    });

    // scale data to fit between the selected base metric's min/max data
    this._unscaledTrackpoints[overlay] = data;
    let scaledData = this._scaleBetween(data, this._minMetricX, this._maxMetricX);
    this.chartData[this.metricIndicies[overlay]].data = scaledData;

    // this function also gets called when base metric is changed
    if (this.selOverlays.indexOf(overlay) == -1) {
      this.selOverlays.push(overlay);
      this._setBaseMetricX();
    }

    this._setAxisDisplay(overlay, true, 'right');
  }

  private _buildBaseMetricControls() {
    switch (this.sessionType) {
      case 'bike': {
        this.baseMetricsX = ['Power', 'Heart Rate', 'Speed'];

        // TODO: set user saved preference if one exists
        if (this._isMetricPresent('Power')){
          this.selBaseMetricY = 'Power';
        } else if (this._isMetricPresent('Heart Rate')) {
          this.selBaseMetricY = 'Heart Rate';
        } else if (this._isMetricPresent('Speed')) {
          this.selBaseMetricY = 'Speed';
        }
        break;
      }
      case 'run':
      case 'swim': {
        this.baseMetricsX = ['Pace', 'Heart Rate'];

        // TODO: set user saved preference if one exists
        if (this._isMetricPresent('Pace')){
          this.selBaseMetricY = 'Pace';
        } else if (this._isMetricPresent('Heart Rate')) {
          this.selBaseMetricY = 'Heart Rate';
        }
        break;
      }
    }

    this.selBaseMetricX = 'Over Time';
  }

  private _buildColor(rgba: string): Color {
    const transparent = 'rgba(0,0,0,0)';
    return  {
      backgroundColor: rgba,
      borderColor: transparent,
      pointBackgroundColor: transparent,
      pointBorderColor: transparent,
      pointHitRadius: 0,
      pointHoverBackgroundColor: transparent,
      pointHoverBorderColor: transparent
    }
  }

  private _buildOverlayControls() {
    switch (this.sessionType) {
      case 'bike': {
        this.overlays = ['Power', 'Heart Rate', 'Speed', 'Cadence', 'Elevation', 'Temperature'];
        break
      }
      case 'run': {
        this.overlays = ['Pace', 'Heart Rate', 'Speed', 'Cadence', 'Elevation', 'Temperature']
        break;
      }
      case 'swim': {
        this.overlays = ['Pace', 'Heart Rate', 'Stroke Rate'];
        break;
      }
    }
  }

  private _formatNumber(num: number, format: string = '1.0-0') {
    return this.decimalPipe.transform(num, format);
  }

  private _formatTime(time: number, format: string = 'HH:mm') {
    return (time && isFinite(time)) ? moment.utc(moment.duration(time, 'seconds').asMilliseconds()).format(format) : 0;
  }

  private _getMetricValue(metric: string, trackpoint: any, lastPoint: any = null) {
    switch (metric) {
      case 'Heart Rate': {
        return +trackpoint.heartRateBpm;
      }
      case 'Pace': {
        // time (min) / distance (mile/km)
        if (lastPoint == null) {
          return 0;
        } else {
          const t = this._getTimeDifference(trackpoint.dateTime, lastPoint.dateTime) / 60;
          const d = ((+trackpoint.distanceMeters) - (+lastPoint.distanceMeters)) * .001;
          if (this.measurementSystem === 'standard') {
            // minutes per mile
            return (t / (d * KM_TO_MI_MULT))
          } else {
            // minutes per km
            return (t / d)
          }
        }
      }
      case 'Power': {
        return +trackpoint.watts;
      }
      case 'Speed': {
        return this.measurementSystem === 'standard'
          ? +trackpoint.speed * 3.6 * KM_TO_MI_MULT
          : +trackpoint.speed * 3.6;
      }
      case 'Cadence': {
        return +trackpoint.cadence;
      }
      case 'Elevation': {
        return this.measurementSystem === 'standard'
          ? +trackpoint.altitudeFeet
          : +trackpoint.altitudeMeters;
      }
      case 'Temperature': {
        return this.measurementSystem === 'standard'
          ? +trackpoint.temp
          : (+trackpoint.temp - 32) * 5 / 9;
      }
    }
  }

  private _getOverlayLabel(axisId: string, label, index: number, labels): any {
    // set the axis tick back to its original scale
    const metric = this.chartData.find(x => x.yAxisID == axisId).label;
    const data  = this._unscaledTrackpoints[metric];
    const value = this._scaleBetween(labels, Math.min(...data), Math.max(...data))[index];
    return this._formatNumber(value);
  }

  private _getTimeDifference(newDate: any, lastDate: any, format: moment.unitOfTime.DurationConstructor = 'seconds') {
    return moment(new Date(newDate)).diff(moment(new Date(lastDate)), format);
  }

  private _isMetricPresent(metric: string) {
    let present = false;
    for (let i = 0; i < this.trackpoints.length; i++) {
      switch (metric) {
        case 'Heart Rate': {
          if (+this.trackpoints[i].heartRateBpm > 0) {
            return present = true;
          }
          break;
        }
        case 'Pace' : {
          if (+this.trackpoints[i].distanceMeters > 0) {
            return present = true;;
          }
          break;
        }
        case 'Power': {
          if (+this.trackpoints[i].watts > 0) {
            return present = true;;
          }
          break;
        }
        case 'Speed': {
          if (+this.trackpoints[i].speed > 0) {
            return present = true;;
          }
          break;
        }
      }
    }

    return present;
  }

  private _removeOverlay(overlay: string) {
    this.chartData[this.metricIndicies[overlay]].data = [];
    this.selOverlays = this.selOverlays.filter(x => x !== overlay);

    this._setAxisDisplay(overlay, false, 'left');
    this._setBaseMetricX();
  }

  private _setAxisDisplay(metric: string, display: boolean, position: string, gridLines: boolean = false) {
    const axisId = this.chartData.find(x => x.label == metric).yAxisID;
    const axis = this.chartOptions.scales.yAxes.find(x => x.id == axisId);
    axis.position = position;
    axis.display = display;
    axis.gridLines.display = gridLines;
    axis.ticks.fontColor = this.getMetricColor(metric);
    axis.ticks.fontSize = 14;
    axis.ticks.fontStyle = 'bold';
    if (!gridLines) {
      axis.ticks.padding = 7;
    } else {
      axis.ticks.padding = 0;
    } 
  }

  private _setBaseMetricY() {
    // reset base metric min/max
    this._minMetricX = this._maxMetricX = 0;

    // if the newly selected base metric was part of the overlays,
    // remove it from the selected overlays
    if (this.selOverlays.indexOf(this.selBaseMetricY) > -1) {
      this.selOverlays = this.selOverlays.filter(x => x != this.selBaseMetricY);
    }

    // remove everything except selected overlays
    Object.keys(this.metricIndicies).forEach(m => {
      if (this.selOverlays.indexOf(m) === -1) {
        this.chartData[this.metricIndicies[m]].data = [];
      }
    });

    let lastPoint = null;
    this.trackpoints.forEach(x => {
      if (this.trackpoints.indexOf(x) % this._averageModulus === 0) {
        const value = this._getMetricValue(this.selBaseMetricY, x, lastPoint);
        lastPoint = x;
        const val = +(value.toFixed(2));
        this.chartData[this.metricIndicies[this.selBaseMetricY]].data.push(val);

        this._minMetricX = this._minMetricX > val ? val : this._minMetricX;
        this._maxMetricX = this._maxMetricX < val ? val : this._maxMetricX;
      }
    });

    this._setBaseMetricX();

    // if there were any overlays selected, they need to be rescaled
    if (this.selOverlays.length > 0) {
      this.selOverlays.forEach(overlay => {
        this._addOverlay(overlay);
      });
    }

    this._setAxisDisplay(this.selBaseMetricY, true, 'left', true);
  }

  private _setBaseMetricX() {
    this.chartLabels = [];

    let initialTime = 0;
    this.trackpoints.forEach(x => {
      if (this.trackpoints.indexOf(x) % this._averageModulus === 0) {
        if (this.selBaseMetricX === 'Over Distance') {
          const distance = this.measurementSystem === 'standard' 
            ? this._formatNumber(+x.distanceMeters * 0.001 * KM_TO_MI_MULT, '1.0-1') + ' mi'
            : this._formatNumber(+x.distanceMeters * 0.001, '1.0-1') + ' km';

          this.chartLabels.push(distance);
        } else if (this.selBaseMetricX === 'Over Time') {
          if (initialTime == 0) {
            this.chartLabels.push(0);
            initialTime = x.dateTime;
          } else {
            const diff = this._getTimeDifference(x.dateTime, initialTime);
            this.chartLabels.push(this._formatTime(diff));
          }
        }
      }
    });
  }

  private _setChartData() {
    this._setBaseMetricY();
    this._setBaseMetricX();
  }

  private _scaleBetween(array: number[], scaledMin: number, scaledMax: number) {
    var max = Math.max.apply(Math, array);
    var min = Math.min.apply(Math, array);
    return array.map(num => parseFloat(((scaledMax-scaledMin)*(num-min)/(max-min)+scaledMin).toFixed(2)) );
  }

  // #endregion
}
