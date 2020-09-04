import { Component, OnChanges, SimpleChange, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { TextEncodeDecode } from '../../../../../common-model/textEncodeDecode.modal';
import { WeeklySummaryService } from '../../weekly-summary.service';

@Component({
  selector: 'app-coach-session-notes',
  templateUrl: './coach-session-notes.component.html',
  styleUrls: ['./coach-session-notes.component.scss']
})
export class CoachSessionNotesComponent implements OnChanges {

  @Input() session;
  @Input() canEdit = false;
  @Output() updateNotes = new EventEmitter();

  notesEditing = true;
  busy = false;
  sessionNotes;
  
  constructor(
    private textEncodeDecode: TextEncodeDecode,
    private weeklyService: WeeklySummaryService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const session: SimpleChange = changes.session;
    if (typeof session === 'undefined') {
      return;
    }
    if (this.session && this.session.coachNotes && this.session.coachNotes.length > 1) {
      this.sessionNotes = this.textEncodeDecode.getDecodedText(this.session.coachNotes);
      this.sessionNotes = this.replaceBrWithNewLine(this.sessionNotes);
      this.notesEditing = !this.sessionNotes;
    } else {
      this.sessionNotes = this.replaceBrWithNewLine(this.sessionNotes);
      this.notesEditing = true;
    }
  }

  getNotes(notes) {
    if(notes){
      return notes.replace(/\n/g, '<br />');
    }
    return notes;
  }
  replaceBrWithNewLine(notes){
    if(notes){
      return notes.replace(/<br \/>/g, '\n');
    }
    return notes;
  }

  async submitNotes(notes: string) {
    this.session.coachNotes = notes;
    this.sessionNotes = notes;

    if (notes) {
      this.notesEditing = false;
    }

    try {

      this.busy = true;
      
      await this.weeklyService.updateCoachNotes(
        this.textEncodeDecode.getEncodedText(notes),
        this.session.sessionId
      ).toPromise();

    } catch (e) {
      console.error(e);
    } finally {
      this.busy = false;
    }
  }
}
