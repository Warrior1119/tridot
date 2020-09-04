import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../../common-services/localstorage.service';


@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent {
  public href: string = "";
  isCoachAccess = false;
  constructor(private router: Router,
              private localstorageService: LocalstorageService) { 
  }

  ngOninit() {
      this.href = this.router.url;
      if(this.localstorageService.getIsCoachAccess()){
        this.isCoachAccess = true;
      }
  }

  getCurrentUrl() {
    let url = this.router.url;
    let data = url.split("/");
    if (data[data.length-1] == "athlete-profile-settings") {
        return "profile-settings";
    } else if (data[data.length-1] == "account-settings") {
        return "account-settings";
    } else if (data[data.length-1] == "preferences") {
        return "preferences";
    } else if (data[data.length-1] == "my-bikes") {
        return "gear";
    }else {
        return "connections";
    }
  }

}
