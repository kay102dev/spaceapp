import {animate, query, style, transition, trigger} from '@angular/animations';

export const  spaceShipAppAnimation = trigger(
        'enterAnimation', [
            transition('* => loaded', [
                query('.dashboard-container', style({opacity: 0})),
                query('.dashboard-container', animate('1.5s', style({opacity: 1})))
            ]),
            transition('out => in, * => in', [
                query('.animate', style({transform: 'translateX(-100%)', opacity: 0}), {optional: true}),
                query('.animate', animate('1s 0s cubic-bezier(0.215, 0.61, 0.355, 1)', style({
                    transform: 'translateX(0%)',
                    opacity: 1
                })), {optional: true})
            ]),
            transition('in => out', [
                query('.animate', style({transform: 'translateX(0%)', opacity: 1}), {optional: true}),
                query('.animate', animate('1s 0s cubic-bezier(0.215, 0.61, 0.355, 1)', style({
                    transform: 'translateX(100%)',
                    opacity: 0
                })), {optional: true})
            ])
        ]);
