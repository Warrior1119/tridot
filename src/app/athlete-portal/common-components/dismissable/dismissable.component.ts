import { Component, Input } from "@angular/core";
import { LocalStorage } from "../../common-services/local-storage";

@Component({
    selector: 'dismissable',
    templateUrl: './dismissable.component.html',
})
export class DismissableComponent {

    @Input() id: string;

    constructor(private _localStorage: LocalStorage) {}

    get visible() {
        return !this._hidden;
    }

    show() {
        this._hidden = false;
    }

    hide() {
        this._hidden = true;
    }

    private get _hidden() {
        return this._localStorage.get<boolean>(this._getKey(this.id), false);
    }

    private set _hidden(value: boolean) {
        this._localStorage.set(this._getKey(this.id), value);
    }

    private _getKey(id = 'default') {
        return `dismissable-${id}-hidden`;
    }

}