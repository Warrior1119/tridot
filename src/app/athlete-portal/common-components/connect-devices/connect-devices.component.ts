import { Component, OnInit,Input } from '@angular/core';
import { UserProfileService } from "../../user/user-profile/user-profile.service";
@Component({
  selector: 'app-connect-devices',
  templateUrl: './connect-devices.component.html',
  styleUrls: ['./connect-devices.component.scss']
})
export class ConnectDevicesComponent implements OnInit {
  @Input() profile;
  constructor() { }


  ngOnInit() {

  }

}
