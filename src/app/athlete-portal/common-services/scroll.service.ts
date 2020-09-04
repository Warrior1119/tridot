import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BrowserUtil } from '../../utils/browser-util';

const BOTTOM_OFFSET = 300;

export interface ScrollInfo {
    top: number,
    isScrolledToBottom: boolean;
}

@Injectable()
export class ScrollService {

    private _attached = false;
    private _scroll = new Subject<ScrollInfo>();

    get scroll() {
        return this._scroll.asObservable();
    }

    constructor(private _util: BrowserUtil) {}

    private get captureOptions() {
        return this._util.passiveSupported ? { capture: true, passive: true } : true;
    }

    isScrolledToBottom(t: HTMLElement) {
        return t.scrollTop + t.offsetHeight >= t.scrollHeight;
    }

    attach() {
        if (this._attached) {
            return;
        }
        window.addEventListener('scroll', this._onScroll.bind(this), this.captureOptions as any);
        window.addEventListener('touchmove', this._onScroll.bind(this), this.captureOptions as any);
    }

    detach() {
        if (!this._attached) {
            return;
        }

        window.removeEventListener('scroll', this._onScroll.bind(this), this.captureOptions as any);
        window.removeEventListener('touchmove', this._onScroll.bind(this), this.captureOptions as any);
    }

    private _onScroll(e: Event) {
        if (!this._scroll) {
            return;
        }

        this._scroll.next({
            top: (e.target as HTMLElement).scrollTop,
            isScrolledToBottom: this.isScrolledToBottom(e.target as HTMLElement),
        });
    }

}