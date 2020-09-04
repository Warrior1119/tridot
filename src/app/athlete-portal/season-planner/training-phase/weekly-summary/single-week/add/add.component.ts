import * as moment from 'moment';
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddComponent {
  @Input() displayModal;
  @Output() session = new EventEmitter();
  errorPlannedTotal: string;
  newSession = {
    sessionType: null,
    location: null,
    warmUpDuration: null,
    sessionTime: null,
    plannedTotal: null,
    indoor: false,
    sessionDetail: {
      warmUp: null,
      mainSet: null,
      coolDown: null,
    }
  };
  isValid = false;

  updateIndoor(indoor: boolean) {
    this.newSession.indoor = indoor;
  }

  closeModal() {
    this.displayModal.hide();
  }

  validate() {
    this.isValid = true;
    if (!this.newSession.sessionType) {
      this.isValid = false;
    }
    if (!this.newSession.location) {
      this.isValid = false;
    }
    if (!this.newSession.sessionTime) {
      this.isValid = false;
    }
    if (!this.newSession.sessionDetail.mainSet) {
      this.isValid = false;
    }
    if (!this._validatePlannedTotal(this.newSession.plannedTotal)) {
      this.isValid = false;
    }
  }

  private _validatePlannedTotal(value) {
    this.errorPlannedTotal = null;
    if (!value) {
      this.errorPlannedTotal = 'Planned time is required';
      return false;
    }
    if (this.convertToSeconds(value) > 86340) {
      this.errorPlannedTotal = 'Planned time must be in between 00:00 to 23:59';
      return false;
    }
    return true;
  }

  save() {
    this.newSession.plannedTotal = this.convertToSeconds(this.newSession.plannedTotal);
    this.newSession.sessionTime = moment(this.newSession.sessionTime).format('hh:mmA');
    this.session.next(this.newSession);
    this.closeModal();
  }

  convertToSeconds(plannedTotal: string) {
    const s = plannedTotal.split(':');
    return moment.duration(parseInt(s[0], 10), 'h').add(parseInt(s[1], 10), 'm').asSeconds();
  }

}
