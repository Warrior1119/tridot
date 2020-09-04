
import { Component, Input, OnInit } from '@angular/core';
import { Animations } from '../../constants/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SwimFormService } from '../swimform.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { LaneLineTestHelpComponent } from './lane-line-test-help/lane-line-test-help.component';

@Component({
  selector: 'app-swim-form-diagnostics',
  templateUrl: './swim-form-diagnostics-modal.component.html',
  styleUrls: ['./swim-form-diagnostics-modal.component.scss'],
  animations: [ Animations.NgIf.ngIfFadeIn ],
})
export class SwimFormDiagnosticsComponent implements OnInit {
  @Input() public displayModal: BsModalRef;
  @Input() public swimForm: any;
  public savedDiagnostics: string;
  public onClose: Subject<boolean>;
  modalRef: BsModalRef;

  strokeRateValid = true;

  constructor(private swimFormService: SwimFormService, private modalService: BsModalService) { }

  public ngOnInit(): void {
    this.swimForm.strokeRateActual = parseFloat(this.swimForm.strokeRateActual).toFixed(1);
    this.onClose = new Subject();
  }

  public closeModal(): void {
    this.onClose.next(false);
    this.displayModal.hide();
  }

  public saveSwimForm(): void {
    if (!this.strokeRateValid) {
      return;
    }

    this.swimFormService.saveSwimFormDiagnostics(this.swimForm).subscribe((res: any) => {
      if (res.header.status === 'success') {
        console.log('success');
        this.savedDiagnostics = 'Saved Swim Form Diagnostics Successfully.';
        this.onClose.next(true);
      }
      if (res.header.status === 'error') {
        console.log('error');
        this.savedDiagnostics = 'Error occurred while saving Swim Form Diagnostics. Please contact support.';
        this.onClose.next(false);
      }
    }, (err) => {
      console.log('error', err);
      this.savedDiagnostics = 'Error occurred while saving Swim Form Diagnostics. Please contact support.';
      this.onClose.next(false);
    });
  }

  openLaneLineTestHelp() {
    this.modalRef = this.modalService.show(LaneLineTestHelpComponent, {
      class: 'modal-lg'
    });
    this.modalRef.content.displayModal = this.modalRef;
  }

  validateStrokeRate(event) {
    const value = parseFloat(event.target.value);
    if (event.target.value.length === 3 && value >= 1.0 && value <= 3.0) {
      this.strokeRateValid = true;
    } else {
      this.strokeRateValid = false;
    }
  }
 }
