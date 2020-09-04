import * as qs from 'qs';
import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { GeneticsService } from './genetics.service';
import { CommonUtils } from '../../athlete-portal/common-util/common-utils';

export const STATE_23 = 'twentythreeandme';

@Component({
    selector: 'genetics-connect-page',
    templateUrl: 'connect.page.html',
})
export class GeneticsConnectPage implements OnInit {
  modalRef: BsModalRef;
  geneticsData: any;
  connectionStatus;
  busy = false;
  serverError: string;

  constructor(
    private geneticsService:  GeneticsService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(res => {
      if (res.error) {
        console.error('23andMe error:', res.error, res.error_description);
      } else if (res.code && res.state === STATE_23) {
        this.addGeneticDevice(res.code);
      }
    });

    this.geneticsData = await this.geneticsService.getGeneticsData().toPromise();
  }

  onConnect() {
    this.geneticsService.getClientId().subscribe(res => {
      if (res.header && res.header.status === 'error') {
        console.error(res.body.response.msg);
        return;
      }
      const config = {
        client_id: res.client_id,
        response_type: 'code',
        approval_prompt: 'auto',
        scope: res.scope,
        state: STATE_23,
        redirect_uri: `${window.location.origin}/user/devices`
      }
      this.openInNewTab(`${res.url}?${qs.stringify(config)}`);
    });
  }

  
  async onFileChange(evt) {
    try {
      this.busy = true;
      this.serverError = null;
      await this.geneticsService.uploadFile(evt.target.files[0]).toPromise();
      this.router.navigate(['/genetics']);
    } catch(err) {
      this.serverError = err.error.body.response.msg;
    } finally {
      this.busy = false;
    }
  }

  private async addGeneticDevice(code: string) {
    const res = await this.geneticsService.addGeneticDevice(code).toPromise();
    console.log('23andMe response', res);
    this.router.navigate(['/genetics']);
  }

  private openInNewTab(url) {
    const win = window.open(url, '_blank');
      if (win == null || typeof win == 'undefined') {  
        CommonUtils.modalMessage('Pop-up Blocked','Please disable your pop-up blocker and try again.', this.modalRef, 'error', this.modalService, 'DISMISS');
    } else{
      win.focus();
    }
  }

}