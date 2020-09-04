import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import { Animations } from '../../../../../constants/animations';
import { WeeklySummaryService } from '../../weekly-summary.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [ 
    Animations.NgIf.ngIfFadeIn,
    Animations.NgIf.ngIfFadeOut,
  ],
})
export class MetricsComponent {
  @Input() displayModal;
  @Input() selectedMetrics;
  @Input() status;
  metrics = [];
  filterType = 'All';
  error = '';
  @Output() saveMetrics = new EventEmitter();

  constructor(private weeklyService: WeeklySummaryService) {

  }

  ngOnInit() {
    this.weeklyService.getConnectedMetrics().then((allMetrics) => {
      this.metrics.push(...allMetrics.Manual);
      if (allMetrics['Garmin Health']) {
        this.metrics.push(...allMetrics['Garmin Health']);
      }  
    });
  }
  
  closeModal() {
    console.log(this.selectedMetrics);
    this.saveMetrics.next(this.selectedMetrics);
    this.displayModal.hide();
  }

  save() {
    this.saveMetrics.next(this.selectedMetrics);
  }

  editTrackableMetric(id) {
    this.error = '';
    this.selectedMetrics.displayList = this.selectedMetrics.displayList || [];
    this.selectedMetrics.trackList = this.selectedMetrics.trackList || [];
    if (!this.selectedMetrics.trackList.includes(id)) {
      this.selectedMetrics.trackList.push(id);
    } else {
      this.selectedMetrics.trackList = this.selectedMetrics.trackList.filter(
        t_metric => t_metric !== id);
    }
    this.save();
  }


  editFavMetric(id) {
    this.error = '';
    if (!this.selectedMetrics.displayList) {
      this.selectedMetrics.displayList = [];
    }
    if (!this.selectedMetrics.trackList) {
      this.selectedMetrics.trackList = [];
    }

    if (!this.selectedMetrics.displayList.includes(id)) {
      if (this.selectedMetrics.trackList.includes(id)) {
        if (this.selectedMetrics.displayList.length > 3) {
          this.error = 'Please select up to three favorites';
          return;
        }
        this.selectedMetrics.displayList.push(id);
        this.save();
      } else {
        // throw error here to the user
        this.error = 'You can only add a currently tracked metric to your favorites';
      }
    } else {
      this.selectedMetrics.displayList = this.selectedMetrics.displayList.filter(
        t_metric => t_metric !== id);
    }
  }

  updateTrack(id) {
    if (!this.selectedMetrics.displayList) {
      this.selectedMetrics.displayList = [];
    }
    if (!this.selectedMetrics.trackList) {
      this.selectedMetrics.trackList = [];
    }
    if (this.selectedMetrics.trackList.includes(id)) {
      const index = this.selectedMetrics.trackList.indexOf(id);
      if (index > -1) {
        this.selectedMetrics.trackList.splice(index, 1);
      }
    } else {
      this.selectedMetrics.trackList.push(id);
    }
  }

  updateDisplay(id) {
    if (!this.selectedMetrics.displayList) {
      this.selectedMetrics.displayList = [];
    }
    if (!this.selectedMetrics.trackList) {
      this.selectedMetrics.trackList = [];
    }
    if (this.selectedMetrics.displayList.includes(id)) {
      const index = this.selectedMetrics.displayList.indexOf(id);
      if (index > -1) {
        this.selectedMetrics.displayList.splice(index, 1);
      }
    } else if (this.selectedMetrics.displayList.length < 3) {
      this.selectedMetrics.displayList.push(id);
    }
  }

}
