import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';
import { UpdateAppModalComponent } from './athlete-portal/common-components/update-app-modal/update-app-modal.component';

@Injectable()
export class UpdateService {
  constructor(private swUpdate: SwUpdate, 
  private snackbar: MatSnackBar
  ) {
    this.swUpdate.available.subscribe(evt => {
      console.log('Update available');
      const snack = this.snackbar.openFromComponent(UpdateAppModalComponent, {
        duration: 60000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: 'update-notification'
      }); 
      snack.onAction().subscribe(() => {
        window.location.reload();
      });
    });
  }
}
