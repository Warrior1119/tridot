import { Pipe, PipeTransform } from "@angular/core";

const LEADING_ZERO_PATTERN = /^(00\:)?0(\d\:\d\d)/;

@Pipe({ name: 'timeFormat' })
export class TimeFormatPipe implements PipeTransform {

    transform(input: any) {
        if (!input) {
            return input;
        }
        if (input === '00:00:00') {
            return '0:00';
        }
        return this._removeLeadingZeros(input).toLowerCase();
    }

    private _removeLeadingZeros(input: string) {
        return input.replace(LEADING_ZERO_PATTERN, '$2').replace(/^0\:(\d\d\:)/, '$1');
    }

}
