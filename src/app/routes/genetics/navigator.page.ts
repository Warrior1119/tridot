import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { GeneticsService } from './genetics.service';
import { Animations } from '../../athlete-portal/constants/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LocalStorage } from '../../athlete-portal/common-services/local-storage';

@Component({
  selector: 'genetics-navigator-page',
  templateUrl: 'navigator.page.html',
  animations: [Animations.NgIf.ngIfExpandHeight],
})
export class GeneticsNavigatorPage implements OnInit {

  geneticsData;
  geneticsInformationModalRef: BsModalRef;
  expandedInformation = false;

  @ViewChild('geneticsInformationModal')
  geneticsInformationModal: TemplateRef<any>;

  get firstView() {
    return !this.localStorage.get('gene-navigator-not-first-view', false);
  }

  set firstView(value: boolean) {
    this.localStorage.set('gene-navigator-not-first-view', !value);
  }

  constructor(
    private geneticsService: GeneticsService,
    private modalService: BsModalService,
    private localStorage: LocalStorage,
  ) { }

  async ngOnInit() {
    this.geneticsData = await this.geneticsService.getGeneticsData().toPromise();

    if (this.firstView) {
      this.openModal(this.geneticsInformationModal)
    }
  }

  openModal(template: TemplateRef<any>) {
    this.geneticsInformationModalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  closeModal() {
    this.geneticsInformationModalRef.hide()
    this.firstView = false;
  }
}