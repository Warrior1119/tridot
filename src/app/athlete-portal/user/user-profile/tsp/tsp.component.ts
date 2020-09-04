import { Component, OnInit } from '@angular/core';
import {UserProfileService} from '../user-profile.service';
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent, PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { SidebarService } from '../../../../layout/sidebar/sidebar.service';
import { LocalstorageService } from './../../../common-services/localstorage.service';

@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.scss']
})
export class TspComponent implements OnInit {
  athleteProfile: any;
  tsp;

  public config: PerfectScrollbarConfigInterface = {};

  constructor(private userProfileService: UserProfileService,
    private sidebarService: SidebarService,
    private localstorageService: LocalstorageService,) {
      this.athleteProfile = this.localstorageService.getAthleteProfileIfExists();
    }

  getTSP() {
    this.userProfileService.tsp().subscribe(res => {
      console.log(res);

      this.tsp = res.body.response;
    });
  }
sideBarToggled(){
  if(this.sidebarService.toggled){
  return false;
  }
  return true;
}
  ngOnInit() {
    this.getTSP();
  }
}
