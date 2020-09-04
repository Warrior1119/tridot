import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-upload-data-file',
  templateUrl: './upload-data-file.component.html',
  styleUrls: ['./upload-data-file.component.scss']
})
export class UploadDataFileComponent implements OnInit {

  @Input() displayModal;

  selectedFileForm;
  selectedFile;
  uploaded_file;
  uploaded_file_src;
  fileName = '';
  @Output() file = new EventEmitter();

  constructor(private fb: FormBuilder) {
    this.selectedFileForm = fb.group({
      selectedFile: ['', Validators.required]
    });
  }

  fileChangeEvent(event: any): void {
    console.log(event);
    if (event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      this.fileName = event.target.files[0].name;
    }

  }


  closeModal() {
    this.displayModal.hide();
  }

  decision(file) {
    this.file.next(file);
    this.closeModal();
  }

  ngOnInit() {
  }

}
