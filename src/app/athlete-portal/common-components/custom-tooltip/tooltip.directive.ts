import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  ApplicationRef,
  Injector,
  Output,
  EventEmitter,
  Renderer2,
} from '@angular/core';
import { CustomTooltipComponent, getContainer } from './tooltip.component';
import { defaultOptions } from './options';
import { isMobileSafari } from '../../../utils/browser';

export interface TemplateInfo {
  data: any;
  show: boolean;
  close: boolean;
  events: any;
}

@Directive({
  selector: '[customTooltip]'
})

export class CustomTooltipDirective {

  hideTimeoutId: number;
  destroyTimeoutId: number;
  hideAfterClickTimeoutId: number;
  createTimeoutId: number;
  showTimeoutId: number;
  componentRef: any;
  elementPosition: any;
  _showDelay: any = 0;
  _hideDelay = 0;
  _id: any;
  _options: any = {};
  _defaultOptions: any;
  _destroyDelay: number;
  componentSubscribe: any;

  /* tslint:disable:no-input-rename */
  @Input('customTooltip') tooltipValue: string;
  /* tslint:enable */

  @Input() tooltipContext: any;

  @Input('options') set options(value: any) {
    if (value && defaultOptions) {
      this._options = value;
    }
  }
  get options() {
    return this._options;
  }

  @Input('placement') set placement(value: string) {
    if (value) {
      this._options['placement'] = value;
    }
  }

  @Input('delay') set delay(value: number) {
    if (value) {
      this._options['delay'] = value;
    }
  }

  @Input('hide-delay-mobile') set hideDelayMobile(value: number) {
    if (value) {
      this._options['hide-delay-mobile'] = value;
    }
  }

  @Input('z-index') set zIndex(value: number) {
    if (value) {
      this._options['z-index'] = value;
    }
  }

  @Input('animation-duration') set animationDuration(value: number) {
    if (value) {
      this._options['animation-duration'] = value;
    }
  }

  @Input('trigger') set trigger(value: string) {
    if (value) {
      this._options['trigger'] = value;
    }
  }

  @Input('isOpen') set isOpen(value: string) {
    if (typeof value !== 'undefined') {
      this._options['isOpen'] = value;
      if (value) {
        setTimeout(() => this.show(), 300);
      } else {
        this.hide();
      }
    }
  }

  @Input('tooltip-class') set tooltipClass(value: string) {
    if (value) {
      this._options['tooltip-class'] = value;
    }
  }

  @Input('display') set display(value: boolean) {
    if (typeof (value) === 'boolean') {
      this._options['display'] = value;
    }
  }

  @Input('display-mobile') set displayMobile(value: boolean) {
    this._options['display-mobile'] = value;
  }

  @Input('shadow') set shadow(value: boolean) {
    this._options['shadow'] = value;
  }

  @Input('theme') set theme(value: boolean) {
    if (value) {
      this._options['theme'] = value;
    }
  }

  @Input('offset') set offset(value: number) {
    if (value) {
      this._options['offset'] = value;
    }
  }

  @Input('offsetX') set offsetX(value: number) {
    if (value) {
      this._options['offsetX'] = value;
    }
  }

  @Input('max-width') set maxWidth(value: number) {
    if (value) {
      this._options['max-width'] = value;
    }
  }

  @Input('id') set id(value: any) {
    this._id = value;
  }
  get id() {
    return this._id;
  }

  @Input('show-delay') set showDelay(value: number) {
    if (value) {
      this._showDelay = this._options['show-delay'] = value;
    }
  }

  get showDelay() {
    let result = this.options['delay'] || this._showDelay;

    if (this.isMobile) {
      return 0;
    } else {
      return result;
    }
  }

  @Input('hide-delay') set hideDelay(value: number) {
    if (value) {
      this._hideDelay = this._options['hide-delay'] = value;
    }
  }

  get hideDelay() {
    if (this.isMobile) {
      return (this._hideDelay >= this.options['hide-delay-mobile']) ? this._hideDelay : this.options['hide-delay-mobile'];
    } else {
      return this._hideDelay;
    }
  }

  @Input('tooltip-type') set tooltipType(value: string) {
    if (value) {
      this._options['tooltip-type'] = value;
      this._options['tooltip-class'] = value == 'error' ? 'tooltip-danger' : '';
    }
  }

  @Input('customTooltip') set customTooltip(value: string) {
    this.tooltipValue = value;
    if (this._options['tooltip-type'] == 'error') {
      if (this.componentRef) {
        this.appRef.detachView(this.componentRef.hostView);
        this.componentRef.destroy();
        this.events.emit('hidden');
      }
      if (value) {
        this.createTooltip();
      }
    }
  }

  get isTooltipDestroyed() {
    return this.componentRef && this.componentRef.hostView.destroyed;
  }

  get destroyDelay() {
    if (this._destroyDelay) {
      return this._destroyDelay;
    } else {
      return Number(this.hideDelay) + Number(this.options['animation-duration']);
    }
  }
  set destroyDelay(value: number) {
    this._destroyDelay = value;
  }

  @Output() events: EventEmitter<any> = new EventEmitter<any>();

  private _eventUnsubscribers = new Array<() => void>();

  constructor(
    private elementRef: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private renderer: Renderer2,
  ) {}

  onMouseEnter() {
    if (this.isDisplayOnHover == false) {
      return;
    }
    
    this.show();
  }

  onMouseLeave() {
    setTimeout(() => {
      if (this.options['trigger'] !== 'hover') {
        return;
      }
      if (!this.componentRef || this.componentRef.instance.hasMouseHovering) {
        return;
      }
      this.destroyTooltip();
    }, 100);
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (this.isDisplayOnClick == false) {
      return;
    }

    this.show();

    this.hideAfterClickTimeoutId = window.setTimeout(() => {
      this.destroyTooltip();
    }, this._hideDelay);
  }

  ngOnInit() {
    this.applyOptionsDefault(defaultOptions, this.options);

    // Disable tooltips for Mobile Safari 
    if (!isMobileSafari()) {
      this._eventUnsubscribers.push(this.renderer.listen(this.elementRef.nativeElement, 'focusin', () => this.onMouseEnter()))
      this._eventUnsubscribers.push(this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.onMouseEnter()))
      this._eventUnsubscribers.push(this.renderer.listen(this.elementRef.nativeElement, 'focusout', () => this.onMouseLeave()))
      this._eventUnsubscribers.push(this.renderer.listen(this.elementRef.nativeElement, 'mouseout', () => this.onMouseLeave()))
    }
  }

  ngOnDestroy() {
    this.destroyTooltip({ fast: true });

    if (this.componentSubscribe) {
      this.componentSubscribe.unsubscribe();
    }

    for (const unsubscriber of this._eventUnsubscribers) {
      unsubscriber();
    }
  }

  getElementPosition() {
    this.elementPosition = this.elementRef.nativeElement.getBoundingClientRect();
  }

  createTooltip() {
    this.clearTimeouts();
    this.getElementPosition();

    this.createTimeoutId = window.setTimeout(() => {
      this.appendComponentToBody(CustomTooltipComponent);
    }, this.showDelay);

    this.showTimeoutId = window.setTimeout(() => {
      this.showTooltipElem();
    }, this.showDelay);
  }

  destroyTooltip(options = { fast: false }) {
    this.clearTimeouts();

    if (this.isTooltipDestroyed == false) {

      this.hideTimeoutId = window.setTimeout(() => {
        this.hideTooltip();
      }, options.fast ? 0 : this.hideDelay);

      this.destroyTimeoutId = window.setTimeout(() => {
        if (!this.componentRef || this.isTooltipDestroyed) {
          return;
        }

        this.appRef.detachView(this.componentRef.hostView);
        this.componentRef.destroy();
        this.events.emit('hidden');
      }, options.fast ? 0 : this.destroyDelay);
    }
  }

  showTooltipElem() {
    this.clearTimeouts();
    (<TemplateInfo>this.componentRef.instance).show = true;
    this.events.emit('show');
  }

  hideTooltip() {
    if (!this.componentRef || this.isTooltipDestroyed) {
      return;
    }
    (<TemplateInfo>this.componentRef.instance).show = false;
    this.events.emit('hide');
  }

  appendComponentToBody(component: any, data: any = {}) {
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    (<TemplateInfo>this.componentRef.instance).data = {
      value: typeof this.tooltipValue === 'string' && this.tooltipValue,
      template: typeof this.tooltipValue !== 'string' && this.tooltipValue,
      context: this.tooltipContext,
      element: this.elementRef.nativeElement,
      elementPosition: this.elementPosition,
      options: this.options,
    }
    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    getContainer().appendChild(domElem);

    this.componentSubscribe = (<TemplateInfo>this.componentRef.instance).events.subscribe((event: any) => {
      this.handleEvents(event);
    });
  }

  clearTimeouts() {
    if (this.createTimeoutId) {
      clearTimeout(this.createTimeoutId);
    }

    if (this.showTimeoutId) {
      clearTimeout(this.showTimeoutId);
    }

    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    if (this.destroyTimeoutId) {
      clearTimeout(this.destroyTimeoutId);
    }
  }

  get isDisplayOnHover(): boolean {
    if (this.options['display'] == false) {
      return false;
    }

    if (this.options['display-mobile'] == false && this.isMobile) {
      return false;
    }

    if (this.options['trigger'] !== 'hover') {
      return false;
    }

    return true;
  }

  get isDisplayOnClick(): boolean {
    if (this.options['display'] == false) {
      return false;
    }

    if (this.options['display-mobile'] == false && this.isMobile) {
      return false;
    }

    if (this.options['trigger'] != 'click') {
      return false;
    }

    return true;
  }

  get isMobile() {
    let check = false;
    navigator.maxTouchPoints ? check = true : check = false;
    return check;
  }

  applyOptionsDefault(defaultOptions, options) {
    this._defaultOptions = Object.assign({}, defaultOptions);
    this.options = Object.assign(this._defaultOptions, options);
  }

  handleEvents(event: any) {
    if (event === 'shown') {
      this.events.emit('shown');
    }
    if (event === 'mouseleave' || event === 'focusout') {
      this.destroyTooltip();
    }
  }

  public show() {
    if (!this.tooltipValue) {
      return;
    }
    if (!this.componentRef || this.isTooltipDestroyed) {
      this.createTooltip();
    } else if (!this.isTooltipDestroyed) {
      this.showTooltipElem();
    }
  }

  public hide() {
    if (!this.tooltipValue) {
      return;
    }
    this.destroyTooltip();
  }
}