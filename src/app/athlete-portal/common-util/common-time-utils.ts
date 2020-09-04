import * as moment from 'moment';

/**
 * Common Util methods to format and compute time related logic
 */
export class CommonTimeUtils {

    public static isTimeValid(value: string) {
        const a = value.split(':');
        if (a.length === 1) {
            return CommonTimeUtils.isValidMinOrSec(a[0]);
        } else if (a.length === 2 || a.length === 3) {
            return CommonTimeUtils.isValidMinOrSec(a[0]) && CommonTimeUtils.isValidMinOrSec(a[1]);
        } else {
            return false;
        }
    }

    public static isValidMinOrSec(value: string): boolean {
        return 0 <= (+value) && (+value) < 60;
    }

    public static isTimeInBetween(value: string, minVal: string, maxVal: string): boolean {
        const valueInSecs   = CommonTimeUtils.calculateTimeInSecs(value);
        const minValInSecs  = CommonTimeUtils.calculateTimeInSecs(minVal);
        const maxValInSecs  = CommonTimeUtils.calculateTimeInSecs(maxVal);
        return valueInSecs >= minValInSecs && valueInSecs <= maxValInSecs;
    }

    public static calculateTimeInSecs(value: string) {
        const a = value.split(':');
        if (a.length === 1) {
            return (+a[0]);
        } else if (a.length === 2) {
            return (+a[0]) * 60 + (+a[1]);
        } else if (a.length === 3) {
            return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        }
    }

    public static removeHours(value: string): string {
        if (value && value.split(':').length === 3) {
            return value.substr(3);
        }
        return value;
    }

    public static ageToMonths(years: string, months: string): number {
        return moment.duration({ years: parseInt(years), months: parseInt(months) }).asMonths();
    }

    public static monthsToAge(value: number) {
        return {
            years: moment.duration(value, 'months').years().toString(),
            months: moment.duration(value, 'months').months().toString()
        }
    }
}
