import { Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[showOverlay]'
})
export class ShowOverlayDirective {

    @Input('showOverlayOverlay') customOverlay: TemplateRef<any>;

    private _renderedOriginalContent = false;
    private _renderedOverlay = false;

    constructor(
        private _viewContainer: ViewContainerRef,
        private _template: TemplateRef<any>,
    ) {}

    @Input()
    set showOverlay(toggle: boolean) {
        this._render(toggle);
    }
    
    private async _render(toggle: boolean) {
        if (!toggle) {
            this._renderOriginalContent();
        } else if (this.customOverlay) {
            this._renderOriginalContent();
            this._renderOverlay();
        } else {
            this._renderEmpty();
        }
    }

    private _renderOriginalContent() {
        if (!this._renderedOriginalContent) {
            this._viewContainer.createEmbeddedView(this._template);
            this._renderedOriginalContent = true;
        }
    }

    private _renderOverlay() {
        if (!this._renderedOverlay) {
            this._viewContainer.createEmbeddedView(this.customOverlay);
            this._renderedOverlay = true;
        }
    }

    private _renderEmpty() {
        this._viewContainer.clear();
        this._renderedOriginalContent = false;
        this._renderedOverlay = false;
    }
}
