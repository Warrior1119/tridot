import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HeaderService {
    public coachMenuTitle = new BehaviorSubject(['Coaches', '/coaches']);

    public updateCoachMenuAsMyCoach() {
        this.coachMenuTitle.next(['My Coach', '/coaches/coach-profile']);
    }

    public updateCoachMenuAsCoaches() {
        this.coachMenuTitle.next(['Coaches', '/coaches']);
    }
}
