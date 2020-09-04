import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-block',
  templateUrl: './info-block.component.html',
})
export class InfoBlockComponent {
  @Input() public title;
  @Input() public value;

  constructor() { }
}
