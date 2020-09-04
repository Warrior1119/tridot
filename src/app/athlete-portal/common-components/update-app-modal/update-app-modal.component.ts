import { Component, Input, Output, EventEmitter, Injectable } from '@angular/core';

@Component({
  selector: 'app-update-app-modal',
  templateUrl: './update-app-modal.component.html',
})
export class UpdateAppModalComponent {
  public updateApp(): void {
    window.location.reload(); 
  }
}
