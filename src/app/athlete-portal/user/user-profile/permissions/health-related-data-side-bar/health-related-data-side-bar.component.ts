import { Component, OnInit } from '@angular/core';
import { permissionsSidebarHeader } from '../../../../constants/constants';

@Component({
  selector: 'app-health-related-data-side-bar',
  templateUrl: './health-related-data-side-bar.component.html',
  styleUrls: ['./health-related-data-side-bar.component.scss']
})
export class HealthRelatedDataSideBarComponent implements OnInit {
  active = {};
  athleteProfile: any;
  headers = permissionsSidebarHeader;
  constructor() {
  }
  async ngOnInit() {
    this.active = this.headers.filter(header => header.link === location.pathname)[0];
  }
}
