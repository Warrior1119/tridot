import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BS_DATEPICKER_DEFAULTS } from '../../constants/constants';
import { LocalstorageService } from './../../common-services/localstorage.service';

@Component({
  selector: 'app-add-rename-season',
  templateUrl: './add-rename-season.component.html',
  styleUrls: ['./add-rename-season.component.scss']
})
export class AddRenameSeasonComponent implements OnInit {
  @Input() AddOrRename;
  @Input() displayModal;
  seasonForm;
  startDate = new Date();
  minDate = new Date();
  name;
  seasonStartDate;
  bsConfig = Object.assign({}, BS_DATEPICKER_DEFAULTS) as Partial<BsDatepickerConfig>;

  @Output() season = new EventEmitter();
  constructor(fb: FormBuilder, private localstorageService: LocalstorageService) {
    this.seasonForm = fb.group({
      name: ['', Validators.required]
    });
  }

  closeModal() {
    this.displayModal.hide();
  }

  addSeason() {

    if(this.AddOrRename == 'Add') {
      let newSeason = {
        athleteId: this.localstorageService.getMemberId(),
        seasonName: this.name,
        seasonStartDate: this.startDate
      }
  
      this.season.next(newSeason);
      this.closeModal();
    } else if (this.AddOrRename == 'Rename') {
      let newSeason = {
        athleteId: this.localstorageService.getMemberId(),
        seasonName: this.name
      }
  
      this.season.next(newSeason);
      this.closeModal();
    }

  }


  ngOnInit() {
  }

}
