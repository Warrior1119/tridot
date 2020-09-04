import { Component, OnChanges, SimpleChange, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { TextEncodeDecode } from '../../../../../common-model/textEncodeDecode.modal';

@Component({
  selector: 'app-session-notes',
  templateUrl: './session-notes.component.html',
  styleUrls: ['./session-notes.component.scss']
})
export class SessionNotesComponent implements OnChanges {
  @Input() session;
  @Output() updateNotes = new EventEmitter();
  notesEditing = true;
  sessionNotes;
  constructor(    private textEncodeDecode: TextEncodeDecode,
    ){

  }

  ngOnChanges(changes: SimpleChanges) {
    const session: SimpleChange = changes.session;
    if (typeof session === 'undefined') {
      return;
    }
    if (this.session && this.session.myNotes && this.session.myNotes.length > 1) {
      this.sessionNotes = this.textEncodeDecode.getDecodedText(this.session.myNotes[1]);
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

  newNotes(notes: string) {
    console.log(JSON.stringify(notes))
    this.session.myNotes = notes;
    this.sessionNotes = notes;
    if (notes) {
      this.notesEditing = false;
    }
    this.updateNotes.emit(this.textEncodeDecode.getEncodedText(notes));
  }
}
