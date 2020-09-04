import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Animations } from '../../../../../constants/animations';

@Component({
  selector: 'app-add-entry-multiple',
  templateUrl: './add-entry-multiple.component.html',
  styleUrls: ['./add-entry-multiple.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn ],
})
export class AddEntryMultipleComponent implements OnInit {
  @Input() metric: any;
  @Input() metrics: any[];
  @Output() metricsToSave = new EventEmitter();
  @Input() displayModal;
  activeTab: number;
  customEntry: string;

  closeModal() {
    this.displayModal.hide();
  }

  save() {
    this.displayModal.hide();
    const editableMetrics = this.metrics.filter(val => val.editable);
    this.metricsToSave.next(editableMetrics);
  }

  ngOnInit() {
    if (this.metric) {
      this.activeTab = this.metric.metricId;
    } else {
      this.activeTab = this.metrics && this.metrics[0] && this.metrics[0].metricId;
    }
  }

}
