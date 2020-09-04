import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { SlackService } from './slack.service';
import { APP_INFO } from '../../../app-info';

@Injectable()
export class AppErrorHandler extends ErrorHandler {

    constructor(private injector: Injector) {
        super();
    }

    handleError(error) {
        try {
            console.error(this._getMessage(error));
            this._handleErrorSessionExpired(error);
            const slackService: SlackService = this.injector.get(SlackService);
            slackService.postErrorOnSlack(error);
        } catch (err) {
            console.log(err);   
        } finally {
            console.log(`TriDot UI version: ${APP_INFO.package.version}`);
        }
    }

    private _getMessage(error) {
        if (error.url) {
            return error.message;
        }

        if (error.stack) {
            const stack = this._sanitizeStack(error);
            return `${error}\n${stack}`;
        }

        return error;
    }

    private _sanitizeStack(error) {
        return error.stack.split(/\n/)
            .filter(line => !line.includes(error.message))
            .map(line => `    at ${line}`)
            .join('\n');
    }

    private _handleErrorSessionExpired(response) {
        if (response && response.body && response.body.response && response.body.response.code == "18002") { 
            location.assign('/login');
        }
        if (response && response.message && response.message.includes("18002")) { 
            location.assign('/login');
        }
    }

}
