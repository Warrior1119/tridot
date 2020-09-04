import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[patternInput]',
    exportAs: 'patternInput',
})
export class PatternInputDirective  {

    @Input() pattern: string|RegExp;
    @Input() patternTemplate: string;
    @Input() noPattern: string;

    constructor(private _elementRef: ElementRef) {}

    @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (e.keyCode === 8) { // Backspace
            return;
        }

        if (e.keyCode === 46) { // Delete
            return;
        }

        if (!e.key || e.key.length > 1) {
            return;
        }

        // Ignore non-printable keys
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return false;
        }

        const value = this._elementRef.nativeElement && this._elementRef.nativeElement.value || '';
        const insertAt = this._elementRef.nativeElement && this._elementRef.nativeElement.selectionStart || 0;
        const newValue = this.patternTemplate 
            ? this.substituteIntoTemplate(this.insertSubstringAt(value, insertAt, e.key), this.patternTemplate)
            : this.insertSubstringAt(value, insertAt, e.key);

        if (!this.match(newValue, this.pattern)) {
            if (this.patternTemplate && insertAt < value.length - 1) {
                this._elementRef.nativeElement.value = value.substr(0, insertAt);
            } else {
                e.preventDefault();
            }
        }

        if (this.noPattern && this.match(newValue, this.noPattern)) {
            e.preventDefault();
        }
    }

    protected match(value: string, pattern: string|RegExp) {
        if (typeof pattern === 'string') {
            pattern = new RegExp(pattern);
        }
        return value.match(pattern);
    }
    
    protected insertSubstringAt(input: string, index: number, substr: string) {
        const arr = input.split('');
        arr.splice(index, 0, substr);
        return arr.join('');
    }
    
    protected substituteIntoTemplate(input: string, template: string) {
        return input + template.substr(input.length);
    }

}
