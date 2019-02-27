import {Logger} from './logger';
import {Level} from './logger-level';
import {isNullOrUndefined} from 'util';

declare var $: any;

export class AppUtil {
    constructor() {
    }

    // Device Screen Size : Use these for responsive look
    public static readonly DEVICE_SCREEN_SIZE = {
        xxs: 320,
        xs: 480,
        sm: 600,
        md: 800,
        lg: 1200,
        xl: 1440
    };

    isObjEmpty(obj) {
            return Object.keys(obj).length === 0;
    }

    limitDecimalAmount(distance, numberOfDecimals: number) {
        return parseFloat(distance).toFixed(numberOfDecimals);
    }

    checkIfCollectionsExist(planetNamesArr, trafficArr, planetRoutesArr) {
        return Object.keys(planetNamesArr).length === 0 &&
            Object.keys(trafficArr).length === 0 &&
            Object.keys(planetRoutesArr).length === 0;
    }

    initFileBrowser(file) {
        $(document).ready(function () {
            $(file).bind('change', function () {
                const filename = $('#chooseFile').val();
                if (/^\s*$/.test(filename)) {
                    $('.file-upload').removeClass('active');
                    $('#noFile').text('No file chosen...');
                } else {
                    $('.file-upload').addClass('active');
                    $('#noFile').text(filename.replace('C:\\fakepath\\', ''));
                }
            });
        });
    }


    // ----- addClass ----- //
    public static addClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add(className);
        }
    }

    // ----- removeClass ----- //
    public static removeClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove(className);
        }
    }
}
