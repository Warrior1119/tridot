/**
 * Model class to hold information related to Horizontal progress bar.
 */
export class ProgressItem {

    constructor(private title: string, private perc: number) {
        if (!perc) {
            this.perc = 0;
        }
    }

    /**
     * Getter $title
     * @return {string}
     */
    public get $title(): string {
        return this.title;
    }

    /**
     * Setter $title
     * @param {string} value
     */
    public set $title(value: string) {
        this.title = value;
    }

    /**
     * Getter $perc
     * @return {double}
     */
    public get $perc(): number {
        return this.perc;
    }

    /**
     * Setter $perc
     * @param {double} value
     */
    public set $perc(value: number) {
        this.perc = value;
    }

}
