import { SEC_PER_KM_TO_SEC_PER_MI_MULT, SEC_PER_100M_TO_SEC_PER_100YDS_MULT } from "../constants/constants";
import * as moment from 'moment';

export class ConversionUtils {
    public static getPace(paceSecs: number, measurementSystem: string, sessionType: string, poolUnits?: string): string {
        let conversionFactor = 1;
        if (sessionType !== 'swim') {
            if (measurementSystem === 'standard') {
                conversionFactor = SEC_PER_KM_TO_SEC_PER_MI_MULT;
            }
        } else {
            if (poolUnits && poolUnits === 'yds') {
                conversionFactor = SEC_PER_100M_TO_SEC_PER_100YDS_MULT;
            }
        }
        const paceSecsConverted = paceSecs * conversionFactor;
        return this._formatTime(+paceSecsConverted);
    }

    private static _formatTime(time: number) {
        return (time && isFinite(time)) ? moment.utc(moment.duration(time, 'seconds').asMilliseconds()).format('HH:mm:ss') : '0';
    }

    public static ftoc(f: number): number{
	    return +((f - 32.0 ) * ( 5.0 / 9.0 )).toFixed(2);
	}

	public static ctof(c: number): number {
		return +(c * ( 9.0 / 5.0 ) + 32.0).toFixed(2);
    }
    
    public static metersToFeet(meters: number): number {
		return +(meters * 3.28084).toFixed(0);
	}

	public static feetToMeters(feet: number): number {
		return +(feet * 0.3048).toFixed(0);
	}
}
