import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { WeeklySummaryService } from '../../weekly-summary.service';
import { SessionCompleteControlsComponent } from '../session-complete-controls/session-complete-controls.component';

@Component({
  selector: 'app-mobile-session-complete-controls',
  templateUrl: './mobile-session-complete-controls.component.html',
  styleUrls: ['./mobile-session-complete-controls.component.scss']
})
export class MobileSessionCompleteControlsComponent extends SessionCompleteControlsComponent {
 
  constructor(
    weeklyService: WeeklySummaryService,
    modalService: BsModalService,
    toastr: ToastrService,
  ) {
    super(
      weeklyService,
      modalService,
      toastr
    );
  }

}
