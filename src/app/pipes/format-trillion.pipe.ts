import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
    name: 'billion'
})
export class BillionPipe implements PipeTransform {

    constructor(private decimalPipe: DecimalPipe) {
    }

    transform(value: any, extension: string = 'billion km/s'): any { // 75000000000000 m/s
        return this.decimalPipe.transform(value / 1000000000000) + extension;
    }
    changeOpacity(className) {
        document.querySelectorAll(className).forEach(el => {
            el.style.transition = "opacity 0.5s linear 0s";
            el.style.opacity = 0.5;
        });
    }
}
