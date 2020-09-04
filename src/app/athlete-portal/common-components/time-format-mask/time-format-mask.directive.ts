import {
    Directive,
    ElementRef,
    forwardRef,
    HostListener,
    OnInit,
    Renderer2
  } from '@angular/core';
  import { Input } from '@angular/core';
  import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
  import * as StringMask from 'string-mask';
import { DEFAULT_TIME_MASK_PATTERN_MM_SS, DEFAULT_TIME_MASK_PATTERN_HH_MM_SS,
  DEFAULT_TIME_PLACEHOLDER_HH_MM_SS, DEFAULT_TIME_PLACEHOLDER_MM_SS } from '../../constants/global.constants';

  const FORMAT_TIME_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimeFormatMaskDirective),
    multi: true
  };

  /**
   *Directive used to input time in corrected order (right to left).
   */
  @Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'input[timeFormatMask]',
    providers: [FORMAT_TIME_VALUE_ACCESSOR]
  })
  export class TimeFormatMaskDirective implements ControlValueAccessor, OnInit {
    // tslint:disable-next-line:no-input-rename
    @Input('timeFormatMask') onEvent: 'keyup' | 'focusout';
    @Input() private maskPattern: string;
    @Input() private includeHour: boolean;
    @Input() private timePattern: string;

    private specialKeys = [ 'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight' ];

    _onChange(_: any) {}
    _onTouched = () => { };

    registerOnChange(fn: (value: any) => any): void {
      this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
      this._onTouched = fn;
    }

    constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

    writeValue(value: any): void {
      if (value !== undefined && value !== null) {
        this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
      }
    }

    ngOnInit(): void {
      this.onEvent = this.onEvent || 'keyup';
      this._elementRef.nativeElement.style.cursor = 'default';
      if (!this._elementRef.nativeElement.placeholder) {
        this._elementRef.nativeElement.placeholder = this.includeHour ? DEFAULT_TIME_PLACEHOLDER_HH_MM_SS : DEFAULT_TIME_PLACEHOLDER_MM_SS;
      }
      if (!this.maskPattern) {
        this.maskPattern = this.includeHour ? DEFAULT_TIME_MASK_PATTERN_HH_MM_SS : DEFAULT_TIME_MASK_PATTERN_MM_SS;
      }
    }

    @HostListener('focusout', ['$event'])
    _onFocusOut(event: KeyboardEvent) {
      const element = <HTMLInputElement> event.target;
      const value = element.value;
      const maskPatternOnFocusOut = this.maskPattern.length === 5 ? '00:00' : '00:00:00';
      const formattedRes = StringMask.process(value.replace(/:/g, ''), maskPatternOnFocusOut, {reverse: true});
      if (formattedRes.valid) {
        this.writeValue(formattedRes.result);
        this._onChange(formattedRes.result);
        this._onTouched();
      }
    }

    @HostListener('keydown', [ '$event' ])
    onKeyDown(event: KeyboardEvent) {
        if (!event.key) {
          return;
        }
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const el: HTMLInputElement = event.target as HTMLInputElement;
        const position: number = (el.selectionStart as number);
        const currentVal: string = this._elementRef.nativeElement.value;
        if (position === currentVal.length) {
          const keyDownVal = event.key;
          const nextVal: string = currentVal.length > 0 ?
                                      [currentVal.slice(0, position), keyDownVal, currentVal.slice(position)].join('') : keyDownVal;
          const formattedRes = StringMask.process(nextVal.replace(/:/g, ''), this.maskPattern, {reverse: true});
          if (!formattedRes.valid) {
            event.preventDefault();
          } else {
            this.writeValue(formattedRes.result);
            this._onChange(formattedRes.result);
            event.preventDefault();
          }
        }
    }

    @HostListener('keyup')
    onKeyUp() {
      this.writeValue(this._elementRef.nativeElement.value);
      this._onChange(this._elementRef.nativeElement.value);
    }
  }
