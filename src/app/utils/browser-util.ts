import { Injectable, ElementRef } from '@angular/core';

@Injectable()
export class BrowserUtil {

    passiveSupported: boolean;

    constructor() {
        this.passiveSupported = this._passiveSupported();
    }
    
    getDocumentScrollHeight(document: Document) {
        return Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight);
    }

    getWindowHeight(window: Window) {
        return window.document.documentElement.clientHeight || window.innerHeight;
    }

    getWindowScrollY(window: Window) {
        return window.pageYOffset || window.document.documentElement.scrollTop;
    }

    getCanvasScrollY() {
        return document.querySelector('[canvas=canvas-wrap]').scrollTop;
    }

    getElementScrollHeight(selector: string) {
        return document.querySelector(selector).scrollHeight;
    }

    relativeScrollY(window: Window, offset: number) {
        let currentY = this.getWindowScrollY(window);
        window.scrollTo(0, currentY + offset);
    }

    private _passiveSupported() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options as any);
            window.removeEventListener('test', null, options as any);
            return passiveSupported;
        } catch(err) {
            return false;
        }
    }
}