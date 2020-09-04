import * as moment from 'moment';
import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BS_DATEPICKER_DEFAULTS } from './../../constants/constants';
import { WeeklySummaryService } from './../../season-planner/training-phase/weekly-summary/weekly-summary.service';

export enum WEEK {
  ONE = 1,
  FOUR,
  EIGHT,
}

@Component({
  selector: 'app-trainx-score',
  templateUrl: './trainx-score.component.html',
  styleUrls: ['./trainx-score.component.scss']
})
export class TrainxScoreComponent implements OnInit, OnChanges {
  get WEEK() {return WEEK; }
  @Input() score;
  @Input() sessionDate;
  public weeklyScore = 0;
  minDate = new Date();
  bsConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    BS_DATEPICKER_DEFAULTS
  );

  weekSelection: WEEK;
  changeWeeksCount = 4;
  dotCount = 1;
  dotScores = [];
  rightScore = 0;
  averageScore = 0;
  startDate = '';
  endDate = '';

  chartData = [{ data: [], label: '', pointHoverRadius: 5}];
  chartLabels = [];
  chartOptions = {
    responsive: true,
    fill: false,
    elements: {
      line: {
        tension: 0
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true,
      onHover: (e, active) => {
        if (active && active.length) {
          const index = active[0]._index;
          this.rightScore = this.chartData[0].data[index];
        } else {
          this.rightScore = this.averageScore;
        }
      }
    },
    tooltips: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }]
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 30
      }
    }
  };

  colors = [{
    backgroundColor: '#ffffff',
    borderColor: '#e741f3',
    borderWidth: 4,
    pointBackgroundColor: '#e741f3',
    pointBorderColor: '#e741f3',
    fill: false
  }];

  constructor(private weeklyService: WeeklySummaryService) {}

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() - 7);
    this.rightScore = this.score;
    this.weekSelection = WEEK.ONE;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sessionDate && changes.sessionDate.currentValue) {
      this.sessionDate = changes.sessionDate.currentValue;
      this.loadWeeklyScore();
    }
  }

  public loadWeeklyScore(): void {
    const startDate = moment(this.sessionDate).startOf('isoWeek').format('MM/DD/YYYY');
    this.weeklyService.weekWorkload(startDate).subscribe((res) => {
      const weekStats = res.body.response.weeks[0];
      if (weekStats) {
        this.weeklyScore = weekStats.achievements;
      }
    }, (err) => {
      console.log(err);
    });
  }

  loadDotScores() {
    if (this.dotCount === 1) {
      return;
    }
    const startDateOfWeek = moment(this.minDate).startOf('isoWeek').toDate();
    this.weeklyService
      .multiWeekScores(startDateOfWeek, this.dotCount)
      .subscribe(res => {
        this.dotScores = res.map((response: any) => {
          return response.body.response.weeks[0].achievements;
        }).reverse();
        while (this.chartLabels.length !== 0) {
          this.chartLabels.pop();
        }
        this.chartLabels.length = 0;
        let index = 0;
        const labels = res.map((response: any) => {
          if (index === 0) {
            this.endDate = this._formatDate(response.body.response.weeks[0].weekEnd);
          } else if (index === this.dotCount - 1) {
            this.startDate = this._formatDate(response.body.response.weeks[0].weekStart);
          }
          index += 1;
          return this.getLabel(response.body.response.weeks[0].weekStart, response.body.response.weeks[0].weekEnd);
        }).reverse();
        this.chartLabels.push(...labels);
        if (this.dotScores && this.dotScores.length > 0) {
          const arrAvg = Math.round(this.dotScores.reduce((a, b) => a + b, 0) / this.dotScores.length);
          this.rightScore = arrAvg;
          this.averageScore = arrAvg;
        }
        this.chartData = [{
          data: this.dotScores,
          pointHoverRadius: 5,
          label: ''
        }];
      });
  }

  public changeWeeks(weekSelect: number): void {
    if (this.weekSelection !== weekSelect) {
      this.weekSelection = weekSelect;
      if (weekSelect === WEEK.FOUR) {
        this.changeWeeksCount = 1;
        this.dotCount = 4;
        this.loadDotScores();
      } else if (weekSelect === WEEK.EIGHT) {
        this.changeWeeksCount = 1;
        this.dotCount = 8;
        this.loadDotScores();
      } else if (weekSelect === WEEK.ONE) {
        this.dotCount = 1;
        this.loadWeeklyScore();
      } else {
        this.dotCount = 1;
      }
    }
  }

  getType(score: number) {
    if (score >= 0 && score < 20) {
      return 'bg-danger';
    } else if (score >= 20 && score < 50) {
      return 'bg-orange';
    } else if (score >= 50 && score < 80) {
      return 'bg-warning';
    } else if (score >= 80 && score <= 100) {
      return 'bg-success';
    }
  }

  dayChange(day) {
    console.log(day);
    if (day) {
      this.minDate = day;
      this.loadDotScores();
    }
  }

  getLabel(start, end) {
    return this.formatLabelDate(start) + '~' + this.formatLabelDate(end);
  }

  formatLabelDate(date) {
    if (!date) {
      return '';
    }
    return moment(date).format('MM/DD/YY');
  }

  public nextWeek(): void {
    if (this.isNextWeekDisabled()) {
      return;
    }
    this.minDate.setDate(this.minDate.getDate() + this.changeWeeksCount * 7);
    if (this.weekSelection === WEEK.ONE) {
      this.loadWeeklyScore();
    } else {
      this.loadDotScores();
    }
  }

  public isNextWeekDisabled(): boolean {
    if (this.endDate) {
      return moment(this.endDate).isAfter();
    } else {
      return true;
    }
  }

  public previousWeek(): void {
    this.minDate.setDate(this.minDate.getDate() - this.changeWeeksCount * 7);
    if (this.weekSelection === WEEK.ONE) {
      this.loadWeeklyScore();
    } else {
      this.loadDotScores();
    }
  }

  getDateRange() {
    return this.startDate + '~' + this.endDate;
  }

  private _formatDate(date) {
    if (!date) {
      return '';
    }
    return moment(date).format('MM/DD/YYYY');
  }
}
