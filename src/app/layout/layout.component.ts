import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { LocalstorageService } from '../athlete-portal/common-services/localstorage.service';
import { SidebarService } from './sidebar/sidebar.service';
import { Router } from '@angular/router';
import { GlobalService } from '../athlete-portal/common-services/global.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent {

  get nosidebar() {
    const { root } = this.router.routerState.snapshot;
    if (
      root.firstChild
      && root.firstChild.firstChild
      && root.firstChild.firstChild.data
    ) {
      return !!root.firstChild.firstChild.data.nosidebar;
    }
    return false;
  }

  get isNavigationVisible() {
    return !this.nosidebar && this.localstorageService.hasUserSignedIn();
  }

  constructor(
    private localstorageService: LocalstorageService,
    private sidebarService: SidebarService,
    private router: Router,
    private globalService: GlobalService,
    private cd: ChangeDetectorRef,
  ) { 
    this.globalService.getLayoutChangedEvent().subscribe(() => {
      console.log('Layout Changed');
      this.cd.detectChanges();
    });
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  getSideBarState() {
    return this.sidebarService.toggled;
  }

  public get isCoachLogin(): boolean {
    return this.localstorageService.isCoachLogin();
  }
}
