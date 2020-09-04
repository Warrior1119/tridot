import { Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { UserProfileService } from '../../user/user-profile/user-profile.service';

@Directive({
  selector: '[isFeatureSubscribed]'
})
export class IsFeatureSubscribedDirective {

    @Input() isFeatureSubscribedOverlay: TemplateRef<any>;
    @Input() isFeatureSubscribedNotrial: boolean;

    private _renderedOriginalContent = false;
    private _renderedOverlay = false;

    constructor(
        private _viewContainer: ViewContainerRef,
        private _template: TemplateRef<any>,
        private userProfileService: UserProfileService,
    ) {}

    @Input()
    set isFeatureSubscribed(requiredFeatures: string[]) {
        this._render(requiredFeatures);
    }
    
    private async _render(requiredFeatures: string[]) {
        const profile = await this._getUserProfile();
        const isFeatureSubscribed = profile.subFeatures && requiredFeatures && requiredFeatures.every(feature => this._isFeatureSubscribed(profile.subFeatures, feature));
        if ((!this.isFeatureSubscribedNotrial || profile.inTrialPeriod != 'true') && isFeatureSubscribed) {
            this._renderOriginalContent();
        } else if (this.isFeatureSubscribedOverlay) {
            this._renderOriginalContent();
            this._renderOverlay();
        } else {
            this._renderEmpty();
        }
    }

    private async _getUserProfile() {
        if (localStorage.athleteProfile) {
            return JSON.parse(localStorage.athleteProfile);
        }
        const res = await this.userProfileService.profile().toPromise();
        return res.body.response.athleteProfile;
    }

    private _renderOriginalContent() {
        if (!this._renderedOriginalContent) {
            this._viewContainer.createEmbeddedView(this._template);
            this._renderedOriginalContent = true;
        }
    }

    private _renderOverlay() {
        if (!this._renderedOverlay) {
            this._viewContainer.createEmbeddedView(this.isFeatureSubscribedOverlay);
            this._renderedOverlay = true;
        }
    }

    private _renderEmpty() {
        this._viewContainer.clear();
        this._renderedOriginalContent = false;
        this._renderedOverlay = false;
    }

    private _isFeatureSubscribed(subFeatures, feature: string) {
        return Boolean(subFeatures[feature]);
    }
}
