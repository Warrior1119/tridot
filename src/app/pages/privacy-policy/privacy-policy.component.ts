import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

export class ReturnPrevious {

  constructor(private location: Location) { } // inject Location into class constructor

  cancel() {
    this.location.back(); // <-- go back to previous location on cancel
  }
}
