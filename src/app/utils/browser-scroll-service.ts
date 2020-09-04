import { Injectable } from "@angular/core";
declare var $: any;

@Injectable()
export class BrowserScrollService {
    // Fix horizontal scrolling for '.table-responsive' for Safari (iOS)
    deltaPreviousX = 0;
    deltaPreviousY = 0;
    onPan(e) {
        if (e.additionalEvent === 'pandown' || e.additionalEvent === 'panup') {
            $('[canvas=canvas-wrap]').scrollTop(this.deltaPreviousY - e.deltaY + $('[canvas=canvas-wrap]').scrollTop());
        }
        if (e.additionalEvent === 'panleft' || e.additionalEvent === 'panright') {
            $('.table-responsive').scrollLeft(this.deltaPreviousX - e.deltaX + $('.table-responsive').scrollLeft());
        }
        this.deltaPreviousX = e.deltaX;
        this.deltaPreviousY = e.deltaY;
    }
    onPanEnd(e) {
        this.deltaPreviousX = 0;
        this.deltaPreviousY = 0;
    }
}