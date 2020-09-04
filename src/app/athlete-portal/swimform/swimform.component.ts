import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressItem } from '../common-components/horizontal-progress-bars/progress-item.model';
import { SwimFormService } from './swimform.service';
import { SwimFormType } from './swim-form-type.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SwimFormDiagnosticsComponent } from './swim-form-diagnostics/swim-form-diagnostics-modal.component';
import { LocalstorageService } from '../common-services/localstorage.service';
import { DEFAULT_PREF_DATE_PATTERN } from '../constants/date-time.constants';
@Component({
  selector: 'app-swimform',
  templateUrl: './swimform.component.html',
  styleUrls: ['./swimform.component.scss']
})
export class SwimformComponent implements OnInit {
  public swimform: any;
  public formMatchProgressItems: ProgressItem[];
  public swimFormTypes: SwimFormType[];
  public currentSwimForm: SwimFormType;
  public modalRef: BsModalRef;
  public swimDrillOptimization = true;
  public yardsOrMeters = 'y';
  profile: any;

  constructor(
    private swimFormService: SwimFormService,
    private router: Router,
    private modalService: BsModalService,
    private localstorageService: LocalstorageService,
  ) {
    this.profile = this.localstorageService.getAthleteProfileIfExists(); 
  }

  get prefDateFormat() {
    return this.profile && this.profile.prefDateFormat || DEFAULT_PREF_DATE_PATTERN;
  }

  private getSwimForm(): void {
    this.swimFormService.swimForm().subscribe((res: any) => {
      // tslint:disable-next-line:triple-equals
      if (res.header.status == 'success') {
        this.swimform = res.body.response;
        if (this.swimform) {
          this.formMatchProgressItems = this.swimFormService.fetchFormMatchProgressItems(this.swimform.swimFormResult);
          if (this.swimform.profile) {
            this.yardsOrMeters = this.swimform.profile.measurementSystem === 'standard' ? 'y' : 'm';
          }
          if (this.swimform.swimFormResult) {
            this.swimFormService.getSwimFormTypes().subscribe((swimFormTypes: SwimFormType[]) => {
              this.swimFormTypes = swimFormTypes;
              if (this.currentSwimForm) {
                this.currentSwimForm = this.swimFormTypes.find((swimFormType) =>
                swimFormType.typeId === this.currentSwimForm.typeId);
              } else {
                this.currentSwimForm = this.swimFormTypes.find((swimFormType) =>
                          swimFormType.typeId === this.swimform.swimFormResult.diagAndAssessmentResult);
              }
            });
          }
        }
      }
    }, (err) => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.getSwimForm();
  }

  public getNextFormType(): void {
    const index = this.swimFormTypes.findIndex(swimFormType => this.currentSwimForm.typeId === swimFormType.typeId);
    if (index === this.swimFormTypes.length - 1) {
      this.currentSwimForm = this.swimFormTypes[0];
    } else {
      this.currentSwimForm = this.swimFormTypes[index + 1];
    }
  }

  public getPreviousFormType(): void {
    const index = this.swimFormTypes.findIndex(swimFormType => this.currentSwimForm.typeId === swimFormType.typeId);
    if (index === 0) {
      this.currentSwimForm = this.swimFormTypes[this.swimFormTypes.length - 1];
    } else {
      this.currentSwimForm = this.swimFormTypes[index - 1];
    }
  }

  public openDiagnosticQuestionsModal(): void {
    const initialState = {
      swimForm: this.swimform.swimForm,
    };
    this.modalRef = this.modalService.show(SwimFormDiagnosticsComponent, {
      class: 'modal-lg', backdrop: false, initialState,
      ignoreBackdropClick: false });
    this.modalRef.content.displayModal = this.modalRef;
    this.modalRef.content.onClose.subscribe(success => {
      if (success) {
        this.getSwimForm();
      }
  })
  }

}
