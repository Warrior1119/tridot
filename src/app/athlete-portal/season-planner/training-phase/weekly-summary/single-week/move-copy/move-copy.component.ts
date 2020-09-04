import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BS_DATEPICKER_DEFAULTS } from '../../../../../constants/constants';
import { LocalstorageService } from '../../../../../common-services/localstorage.service';
import { PLACEHOLDER_DD_MM_YYYY } from '../../../../../constants/date-time.constants';

@Component({
  selector: 'app-move-copy',
  templateUrl: './move-copy.component.html',
  styleUrls: ['./move-copy.component.scss']
})
export class MoveCopyComponent implements OnInit {
  @Input() MoveOrCopy;
  @Input() dayOrSession;
  @Input() displayModal;
  moveOrCopyForm;
  startDate = new Date();
  minDate = new Date();
  name;
  seasonStartDate;
  selectedDate;
  bsConfig = Object.assign({}, BS_DATEPICKER_DEFAULTS) as Partial<BsDatepickerConfig>;
  profile: any;

  @Output() setDate = new EventEmitter();
  constructor(
    fb: FormBuilder,
    private localstorageService: LocalstorageService,
  ) {
    this.moveOrCopyForm = fb.group({
      selectedDate: ['', Validators.required]
    });
    this.profile = this.localstorageService.getAthleteProfileIfExists();
    
    if (this.profile && this.profile.prefDateFormat) {
      this.bsConfig.dateInputFormat = this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
        ? 'D MMMM, YYYY'
        : BS_DATEPICKER_DEFAULTS.dateInputFormat;
    }
  }

  ngOnInit() {
    this.selectedDate = new Date();
  }

  closeModal() {
    this.displayModal.hide();
  }

  decision(date) {
      this.setDate.next(date);
      this.closeModal();
  }

}
