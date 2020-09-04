import { Component, OnInit } from '@angular/core';
import { AthleteCancellationService } from '../user-profile/athlete-cancellation.service';
import { LocalstorageService } from '../../common-services/localstorage.service';
import * as moment from 'moment';
import { DEFAULT_PREF_DATE_PATTERN } from '../../constants/date-time.constants';

@Component({
  selector: 'app-cancel-survey',
  templateUrl: './cancel-survey.component.html',
  styleUrls: ['./cancel-survey.component.scss']
})
export class CancelSurveyComponent implements OnInit {

  questions: any[];
  currentQuestionIndex = -1;
  done = false;
  errorMessage = '';
  subscriptionEndDate: string;

  constructor(
    private _athleteCancellationService: AthleteCancellationService,
    private localstorageService: LocalstorageService,
  ) {}

  async ngOnInit() {
    this.questions = (await this._athleteCancellationService.getCancellationQuestions())
      .sort((a, b) => a.sequenceNo - b.sequenceNo);
    const profile = this.localstorageService.getAthleteProfileIfExists();
    const daysRemaining = +profile.subscriptionDaysRemain;
    if (daysRemaining > 0) {
      const todayDate = moment();
      const dateFormat = profile.prefDateFormat ? profile.prefDateFormat : DEFAULT_PREF_DATE_PATTERN;
      this.subscriptionEndDate = todayDate.add(daysRemaining, 'days').format(dateFormat);
    }
  }

  async next() {
    if (this.currentQuestionIndex !== -1) {
      await this._submitCurrentAnswer();
    }
    if (!this.errorMessage) {
      this.currentQuestionIndex++;
    }
  }

  prev() {
    this.currentQuestionIndex--;
  }

  cancel() {
    window.history.back();
  }

  onMultiChange(index: number, checked: boolean) {
    const choice = this.questions[this.currentQuestionIndex].surveyQuestionOptions[index].id;
    
    let answer = this.questions[this.currentQuestionIndex].answer || [];
    answer = answer.filter(x => x != choice);
    if (checked) {
      answer.push(choice);
    }
    this.questions[this.currentQuestionIndex].answer = answer;
  }

  async submit() {
    await this._submitCurrentAnswer();
    if (!this.errorMessage) {
      this.done = true;
    }
  }

  private async _submitCurrentAnswer() {
    this.errorMessage = '';
    const {id, answer} = this.questions[this.currentQuestionIndex];
    try {
      if (!answer) {
        this.errorMessage = "This question requires an answer.";
        return;
      }
      await this._athleteCancellationService.submitCancellationSurveyAnswer(id, answer);
    } catch (err) {
      console.error('Could not submit cancellation survey', err);
      if (err.error && err.error.body && err.error.body.response) {
        this.errorMessage = err.error.body.response.msg;
      }
    }
  }

}
