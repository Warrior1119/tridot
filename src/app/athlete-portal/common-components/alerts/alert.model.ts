export class Alert {
    constructor(public type, public msg?) {
        if (!this.msg) {
            this.msg = 'Unable to process request, please contact support.';
        }
    }
}
