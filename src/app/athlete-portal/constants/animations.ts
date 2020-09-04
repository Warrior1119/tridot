import { trigger, transition, animate, style, state } from '@angular/animations';

const DEFAULT_ANIMATION_DURATION = '200ms';
const DEFAULT_ANIMATION_DURATION_SLOW = '400ms';
const DEFAULT_ANIMATION_EASING = 'ease';

export namespace Animations {
    export namespace ExpandCollapse {
        export const expandHeight = trigger('expandHeight', [
            state('collapsed', style({ opacity: 0, height: '0px' })),
            state('expanded', style({ opacity: 1, height: '*' })),
            transition('collapsed => expanded', animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`)),
            transition('expanded => collapsed', animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`))
        ]);
        export const expandWidth = trigger('expandWidth', [
            state('collapsed', style({ opacity: 0, width: '0px' })),
            state('expanded', style({ opacity: 1, width: '*' })),
            transition('collapsed => expanded', animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`)),
            transition('expanded => collapsed', animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`))
        ]);
    }
    export namespace NgIf {
        export const ngIfExpandHeight = trigger('ngIfExpandHeight', [
            transition(':enter', [
                style({ opacity: 0, height: '0px' }),
                animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 1, height: '*' }))
            ]),
        ]);
        export const ngIfExpandWidthSlow = trigger('ngIfExpandWidthSlow', [
            transition(':enter', [
                style({ opacity: 0, width: '0px' }),
                animate(`${DEFAULT_ANIMATION_DURATION_SLOW} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 1, width: '*' }))
            ]),
        ]);
        export const ngIfFadeIn = trigger('ngIfFadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 1 }))
            ]),
        ]);
        export const ngIfFadeOut = trigger('ngIfFadeOut', [
            transition(':leave', [
                style({ opacity: 1 }),
                animate(`${DEFAULT_ANIMATION_DURATION} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 0 }))
            ]),
        ]);
        export const ngIfFadeInSlow = trigger('ngIfFadeInSlow', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(`${DEFAULT_ANIMATION_DURATION_SLOW} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 1 }))
            ]),
        ]);
        export const ngIfFadeOutSlow = trigger('ngIfFadeOutSlow', [
            transition(':leave', [
                style({ opacity: 1 }),
                animate(`${DEFAULT_ANIMATION_DURATION_SLOW} ${DEFAULT_ANIMATION_EASING}`,
                    style({ opacity: 0 }))
            ]),
        ]);
    }
}