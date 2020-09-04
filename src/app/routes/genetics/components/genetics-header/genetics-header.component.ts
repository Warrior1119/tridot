import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'genetics-header',
  templateUrl: './genetics-header.component.html',
  styleUrls: ['./genetics-header.component.scss']
})
export class GeneticsHeaderComponent implements OnInit {

  @Input() geneticsData;
  activeTab = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(({tab}) => {
      if (tab) {
        this.activeTab = +tab;
      }
    });
  }

}
