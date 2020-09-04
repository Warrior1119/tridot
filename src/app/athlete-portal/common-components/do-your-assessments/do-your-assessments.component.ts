import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardServiceService } from '../../common-services/dashboard-service.service';

@Component({
  selector: 'app-do-your-assessments',
  templateUrl: './do-your-assessments.component.html',
  styleUrls: ['./do-your-assessments.component.scss']
})
export class DoYourAssessmentsComponent implements OnInit {
  @Input() profile;
  constructor(private route: Router, private dashboardService: DashboardServiceService) {

  }


  ngOnInit() {

  }

}
