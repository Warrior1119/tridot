import { Injectable } from '@angular/core';
import { LocalStorage } from '../../athlete-portal/common-services/local-storage';

@Injectable()
export class SidebarService {
  constructor(
    private localStorage: LocalStorage,
  ) { }

  get toggled() {
    return this.localStorage.get<boolean>('sidebar-toggled', false);
  }

  set toggled(value: boolean) {
    this.localStorage.set('sidebar-toggled', value);
  }

  toggle() {
    this.toggled = !this.toggled;
  }
}
