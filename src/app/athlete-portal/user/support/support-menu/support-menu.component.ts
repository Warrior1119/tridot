import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-support-menu',
  templateUrl: './support-menu.component.html',
  styleUrls: ['./support-menu.component.scss']
})
export class SupportMenuComponent implements OnInit {
  @Input() sections;
  @Input() selectedSection;
  @Output() sectionChange = new EventEmitter();
  @Input() mobile;
  index = 0;
 
  constructor() { }

  ngOnInit() {
  }

  changeSection(newIndex) {
    this.sectionChange.emit({ index: newIndex });
    this.index=newIndex;
  }

}
