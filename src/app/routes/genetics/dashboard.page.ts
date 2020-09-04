import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { GeneticsService } from './genetics.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'genetics-dashboard-page',
    templateUrl: 'dashboard.page.html',
})
export class GeneticsDashboardPage implements OnInit {
  connectionStatus: any;
  geneticsData: any;
  geneticsInformationModalRef: BsModalRef;

  busy = false;
  serverSuccess = false;
  serverError: string;

  constructor(
    private router: Router,
    private geneticsService: GeneticsService,
    private modalService: BsModalService,
  ) {}

  async ngOnInit() {
    this.connectionStatus = await this.geneticsService.getConnectionStatus();
    if (!this.connectionStatus) {
      this.router.navigate(['/genetics/connect']);
      return;
    }
    await this._getDeneticsData();
  }

  openModal(template: TemplateRef<any>) {
    this.geneticsInformationModalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  toResults(tab: number) {
    this.router.navigate(['/genetics/navigator'], { queryParams: { tab }});
  }

  async onFileChange(evt) {
    try {
      this.busy = true;
      this.serverSuccess = false;
      this.serverError = null;
      await this.geneticsService.uploadFile(evt.target.files[0]).toPromise();
      this.serverSuccess = true;
      await this._getDeneticsData();
    } catch(err) {
      this.serverError = err.error.body.response.msg;
    } finally {
      this.busy = false;
    }
  }

  private async _getDeneticsData() {
    this.geneticsData = await this.geneticsService.getGeneticsData().toPromise();
  }

}