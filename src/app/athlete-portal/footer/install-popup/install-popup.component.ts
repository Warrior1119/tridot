import { Component, OnInit, ViewChild } from '@angular/core';
import { DismissableComponent } from '../../common-components/dismissable/dismissable.component';
import { LocalstorageService } from '../../common-services/localstorage.service';
import { UserProfileService } from '../../user/user-profile/user-profile.service';
import { getWindowWidth } from '../../../utils/browser';

@Component({
    selector: 'app-install-popup',
    templateUrl: './install-popup.component.html',
    styleUrls: ['./install-popup.component.scss']
})
export class InstallPopupComponent implements OnInit {
    @ViewChild(DismissableComponent) dismissable;

    showInstallMessage = false;

    constructor(
        private localStorageService: LocalstorageService,
        private userService: UserProfileService,
    ) {}

    async ngOnInit() {
        this.showInstallMessage = await this._shouldShowInstallMessage(window);
    }

    async dismiss() {
        await this.userService.appDownloadDismissed();
        this.dismissable.hide();
    }

    private async _shouldShowInstallMessage(window) {
        const profile = this.localStorageService.getAthleteProfileIfExists();
        if (this._isMobile() && profile.mobileFirstLogin) {
            if (!window.navigator.standalone && !profile.downloadMessageDismissed) {
                return true;
            }
        }
    }

    private _isMobile() {
        return getWindowWidth(window) < 576;
    }
}
