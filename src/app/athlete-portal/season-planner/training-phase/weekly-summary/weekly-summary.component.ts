import * as moment from 'moment';
import Debounce from 'debounce-decorator';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { WeeklySummaryService } from './weekly-summary.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DEFAULT_ERROR_MESSAGE, BS_DATEPICKER_DEFAULTS, DEBOUNCE_INTERVAL_DEFAULT_MS, MOBILE_WIDTH_THRESHOLD } from '../../../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonUtils } from '../../../common-util/common-utils';
import { ScrollService, ScrollInfo } from '../../../common-services/scroll.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { LocalstorageService } from '../../../common-services/localstorage.service';
import { getWindowWidth } from '../../../../utils/browser';
import { Subscription } from 'rxjs';
import { PLACEHOLDER_DD_MM_YYYY } from '../../../constants/date-time.constants';

const MOBILE_MAX_WEEKS = 4;

@Component({
    selector: 'app-weekly-summary',
    templateUrl: './weekly-summary.component.html',
    styleUrls: ['./weekly-summary.component.scss']
})
export class WeeklySummaryComponent implements OnInit, OnDestroy {
    showMenu;
    week;
    modalRef: BsModalRef;
    minDate = new Date();
    noOfWeeks = 1;
    trainXScoreXPosition;
    multipleWeeks;
    bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, BS_DATEPICKER_DEFAULTS);
    alerts: any[] = [];
    raceDetails;
    phasePrior;
    phaseNext;
    footerMode: 'past'|'current'|'future';
    currentPhaseStart: string;
    currentPhaseEnd: string;
    isCoachAccess =false;
    loading;
    showData = true;
    scrollSub: Subscription;
    profile: any;

    constructor(
      private router: Router,
      private weeklySummaryService: WeeklySummaryService,
      private route: ActivatedRoute,
      private modalService: BsModalService,
      private toastr: ToastrService,
      private localstorageService: LocalstorageService,
      private scrollService: ScrollService,
      private changeDetector: ChangeDetectorRef,
    ) {
      
      this.weeklySummaryService.getWeeksFromApi();

      this.route.queryParams.subscribe((res) => {
        if (res.minDate && res.weeks) {
          this.minDate = new Date(res.minDate);
          this.noOfWeeks = parseInt(res.weeks, 10);
          this.getWeek(this.minDate, null);
        } else {
          this.dayChange(new Date());
        }
      });

      this.profile = this.localstorageService.getAthleteProfileIfExists();

      if (this.profile && this.profile.prefDateFormat) {
        this.bsConfig.dateInputFormat = this.profile.prefDateFormat === PLACEHOLDER_DD_MM_YYYY
          ? 'D MMMM, YYYY'
          : BS_DATEPICKER_DEFAULTS.dateInputFormat;
      }
    }
    
    dayChange(day) {
      if (day) {
        this.router.navigate(['/season-planner/training-phase/weekly-summary'], { queryParams: { minDate: day, weeks: this.noOfWeeks } });
      }
    }

    goToCurrentPhase() {
      this.dayChange(new Date());
    }

    goToNextPhase() {
      this.dayChange(this.currentPhaseEnd);
    }

    async getWeek(minDate, modalres, hideDataWhileLoading = true, showLoader = true) {

      if (hideDataWhileLoading) {
        this.showData = false;
      }

      if (showLoader) {
        this.loading = true;
      }

      try {
        if (!moment(minDate).isValid()) {
          throw new Error('Invalid start date');
        }
        const startDate = moment(minDate).startOf('isoWeek').format('MM/DD/YYYY');
        const endDate = moment(minDate).endOf('isoWeek').add(this.noOfWeeks - 1, 'weeks').format('MM/DD/YYYY');
        const res = await this.weeklySummaryService.getMultiWeeks(startDate, endDate).toPromise();
        this.minDate = minDate;
        this.loading = false;
        const {raceDeatails, weeks, nextPhaseDetails, priorPhaseDetails} = res.body.response;
        this.multipleWeeks = weeks;

        // Phases
        this.raceDetails = raceDeatails;
        this.phasePrior = priorPhaseDetails;
        this.phaseNext = nextPhaseDetails;

        if (priorPhaseDetails) {
          const isInCurrentPhase = moment().isBetween(raceDeatails.raceStartDate, raceDeatails.raceEndDate);
          const isInFuturePhase = moment().isBefore(priorPhaseDetails.raceEndDate);
          this.footerMode = isInCurrentPhase ? 'current' : isInFuturePhase ? 'future' : 'past'; 
        }
        
        this.currentPhaseStart = raceDeatails.raceStartDate;
        this.currentPhaseEnd = raceDeatails.raceEndDate;
        if(modalres!=null){
          modalres.modalRef.hide();
          CommonUtils.modalMessage(modalres.title,null,this.modalRef,'success',this.modalService,'View Sessions(s)');
        }
      } catch (err) {
        this.loading = false;
        CommonUtils.modalMessage('Error','Something went wrong. Please try again later.',this.modalRef,'error',this.modalService,'DISMISS');
        modalres.modalRef.hide();
        console.error(err);
      } finally {
        this.showData = true;
      }
    }

    async loadNextWeek() {
      this.loading = true;
      try {
        const startDate = moment(this.minDate).startOf('isoWeek').add(++this.noOfWeeks - 1, 'weeks').format('MM/DD/YYYY');
        const endDate = moment(this.minDate).endOf('isoWeek').add(this.noOfWeeks - 1, 'weeks').format('MM/DD/YYYY');
        const res = await this.weeklySummaryService.getMultiWeeks(startDate, endDate).toPromise();
        if (res.header && res.header.status === 'success') {
          if (this.multipleWeeks.length > MOBILE_MAX_WEEKS) {
            this.multipleWeeks.splice(0, this.multipleWeeks.length - MOBILE_MAX_WEEKS)
          }
          this.multipleWeeks.push(...res.body.response.weeks);
          this.loading = false;
          this.changeDetector.detectChanges();
        }
      } catch (err) {
        this.loading = false;
        console.error(err);
      }
    }

    updateAlerts(alert) {
      try {
        if (typeof this.toastr[alert.type] === 'function') {
          this.toastr[alert.type](alert.msg);
        }
      } catch (err) {
        console.error(err);
      }
    }

    updateWeek(res) {
      if (res.status === true) {
        setTimeout(() => {
          this.getWeek(this.minDate, res);
        }, 1000);
      }     
    }

    getMonday(date) {
      date = moment(date).toDate();
      const day = date.getDay(), diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    getMaxDate(minDate) {
      const d = moment(minDate.toString()).toDate();
      return new Date(d.setDate(d.getDate() + (this.noOfWeeks * 7)));
    }

    extractDate(date) {
      const d = new Date(date);
      return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    }

    nextWeek(currentDate) {
      this.minDate = new Date(this.minDate.setDate(currentDate.getDate() + (this.noOfWeeks * 7)));
      this.router.navigate(['/season-planner/training-phase/weekly-summary'], { queryParams: { minDate: this.minDate, weeks: this.noOfWeeks } });
    }

    previousWeek(currentDate) {
      this.minDate = new Date(this.minDate.setDate(currentDate.getDate() - (this.noOfWeeks * 7)));
      this.router.navigate(['/season-planner/training-phase/weekly-summary'], { queryParams: { minDate: this.minDate, weeks: this.noOfWeeks } });
    }

    async increaseNoOfWeeks() {
      if (this.noOfWeeks < 4) {
        let moveModalref= CommonUtils.modalMessage('Loading...','Fetching new week',this.modalRef,'loading',this.modalService,null);
        this.noOfWeeks += 1;
        try {
          await this.getWeek(this.minDate, null, false);
        } catch (err) {
          CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
        } finally {
          moveModalref.modalRef.hide();
        }
      }
    }
    async decreaseNoOfWeeks() {
      if (this.loading !== true) {
        if (this.noOfWeeks > 1) {
          let moveModalref= CommonUtils.modalMessage('Loading...','Fetching new week',this.modalRef,'loading',this.modalService,null);
          this.noOfWeeks -= 1;
          try {
            await this.getWeek(this.minDate, null, false);
          } catch (err) {
            CommonUtils.modalMessage('Error', err.error.body.response.msg || DEFAULT_ERROR_MESSAGE,this.modalRef,'error',this.modalService,'Try again');
          } finally {
            moveModalref.modalRef.hide();
          }
        }
      }
    }

    ngOnInit() {
      if(this.localstorageService.getIsCoachAccess()){
        this.isCoachAccess = true;
      }
      this.weeklySummaryService.getWeeks().subscribe((week) => {
        this.week = week;
        console.log(this.week);
      });
      if (this.isMobile) {
        this.scrollService.attach();
        this.scrollSub = this.scrollService.scroll.subscribe(e => this.onScroll(e));
      }
    }

    ngOnDestroy() {
      this.scrollService.detach();
      this.scrollSub && this.scrollSub.unsubscribe();
    }

    @Debounce(DEBOUNCE_INTERVAL_DEFAULT_MS)
    onScroll(e: ScrollInfo) {
      if (this.loading) {
        return;
      }
      if (e.isScrolledToBottom) {
        this.loadNextWeek();
      }
    }

    openMenu() {
      this.showMenu = !this.showMenu;
    }

    get isMobile() {
      return getWindowWidth(window) < MOBILE_WIDTH_THRESHOLD;
    }
}
