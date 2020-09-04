
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError, tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


import { GlobalService } from '../../common-services/global.service';
import { SAVE_ATHLETE_PROFILE_API } from '../../constants/api-end-points';
import * as moment from 'moment';
import { parseFloatSafe } from '../../../utils/string';

@Injectable()
export class UserProfileService {

    get savingProfile() {
        return this._savingProfile;
    }

    private get accessToken() {
        return localStorage.accessToken;
    }

    private get profileId() {
        return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteId : '';
    }

    private get memberId() {
        return localStorage.athleteProfile ? JSON.parse(localStorage.athleteProfile).athleteProfileId : '';
    }

    private _savingProfile = false;

    constructor(
        private http: HttpClient,
        private globalService: GlobalService,
    ) {}

    editProfilePicture(payload: FormData): any {
        // Need custom headers
        const reqPayload = {
            header: { accessToken: this.accessToken }, body: {
                userType: 'athlete',
                userId: this.profileId,
                photoType: 'profile'
            }
        };
        payload.append('uploadMetaData', JSON.stringify(reqPayload));
        console.log(payload.get('file'));

        // send
        return this.http.post(environment.API_ENDPOINT + '/dipsvc/file/photo/receive', payload).pipe(catchError(res => observableThrowError(res)));
    }
    addDeviceStart(id): any {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/device/requestToken/'+id).pipe(
          catchError(res => observableThrowError(res)));
    }
    addDeviceWithVerifierEnd(authorizedToken, verifier,device): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/addDevice',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    deviceId: device,
                    authorizedToken: authorizedToken,
                    verifier: verifier,
                    oauthSecret: localStorage.unauthorizedTokenSecret
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    saveUserHealthRelatedPreferance(healthFlag): any {
        console.log("hr flag "+healthFlag)
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/allowOrNotHealthDevices',
        {
            header: { accessToken: this.accessToken }, body: {
                athleteId: this.profileId,
                healthFlag: healthFlag
            }
        }).pipe(catchError(res => observableThrowError(res)));

    }

    addStravaStart(): any {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/device/getStravaUrl').pipe(
            catchError(res => observableThrowError(res)));
    }
    updateUXPreference(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/user/updateUiVersion',
        {
            header: { accessToken: this.accessToken }, body: {
                athleteId: this.profileId
            }
        }).pipe(catchError(res => observableThrowError(res)));
    }
    addStravaEnd(code): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/stravaAdd',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    code: code
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    addGarminEnd(authorizedToken, verifier): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/accessToken',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    deviceId: 1,
                    authorizedToken: authorizedToken,
                    verifier: verifier,
                    oauthSecret: localStorage.unauthorizedTokenSecret
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    addGarminStart(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/tempToken',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    deviceId: 1
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    addGarminTrainingEnd(authorizedToken, verifier): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/accessToken',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    deviceId: 8,
                    authorizedToken: authorizedToken,
                    verifier: verifier,
                    oauthSecret: localStorage.unauthorizedTokenSecret
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    addGarminTrainingStart(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/tempToken',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    deviceId: 8
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    addPolarStart(): any {
        console.log("inside add polar");
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/device/getPolarUrl').pipe(
        catchError(res => observableThrowError(res)));

    }
    addPolarEnd(code): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/polarAdd',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.memberId,
                    code: code
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    disconnectDevice(id): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/disconnect',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    vendorId: id
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    getDevices(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/device/devices',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    updatePayment(payment): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/updatepaymentinfo',
            {
                header: { accessToken: this.accessToken }, body: payment
            }).pipe(catchError(res => observableThrowError(res)));
    }

    getMemberPreferences(memberId): any {
      return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/member-preferences/' + memberId).pipe(catchError(res => observableThrowError(res)));
    }

    saveMemberPreferences(memberId, data): any {
      return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/member-preferences/' + memberId, data).pipe(catchError(res => observableThrowError(res)));
    }

    isDowngradeFeasible(subLevelId): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/isDowngradeFeasible',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    subscriptionLevelId: subLevelId,
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    async changeSubscriptionTrialRun(data): Promise<any> {
        try {
            const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/trialrun',
            {
                header: { accessToken: this.accessToken }, body: data
            }).toPromise();

            return this._parseChargeSubscriptionResult(res.body.response);
        } catch (err) {
            throw err;
        }
    }

    async postPromotionInfo(data): Promise<any> {
        try {
            const res: any = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/promotionInfo',
            {
                header: { accessToken: this.accessToken }, body: data
            }).toPromise();
            return this._parseChargeSubscriptionResult(res.body.response);
        } catch (err) {
            throw err;
        }
    }

    async changeSubscription(data): Promise<any> {
        try {
            const res = await this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/changesubscription',
            {
                header: { accessToken: this.accessToken }, body: data
            }).toPromise();

            return res;
        } catch (err) {
            throw err;
        }
    }

    private _parseChargeSubscriptionResult(obj): Promise<any> {
        obj.activationFee = parseFloatSafe(obj.activationFee);
        obj.cost = parseFloatSafe(obj.cost);
        obj.totalCost = parseFloatSafe(obj.totalCost);
        obj.refundAmount = parseFloatSafe(obj.refundAmount);
        return obj;
    }

    subscription(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/get',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    createClientIntent(): any {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/stripe/create-setup-intent').pipe(
                                                                    catchError(res => observableThrowError(res)));
    }

    async subOptions(): Promise<any> {
        const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/sub/getSubscriptionOptionsForAthlete`, {
            header: { accessToken: this.accessToken },
            body: {
                athleteId: this.profileId,
                latitude: null,
                longitude: null
            }
        }).toPromise();
        return res.body.response;
    }

    getBikes(): any {
        return this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/bike/all').pipe(
            catchError(res => observableThrowError(res)));
    }

    saveBike(athleteId, bike): any {
        return this.http.post(environment.API_ENDPOINT + `/athletesvcs/athlete/${athleteId}/bikes`, bike).pipe(
            catchError(res => observableThrowError(res)));
    }

    deleteBike(athleteId, bikeId): any {
      return this.http.delete(environment.API_ENDPOINT + `/athletesvcs/athlete/${athleteId}/bikes/${bikeId}`).pipe(
          catchError(res => observableThrowError(res)));
    }

    toggleBikeActiveStatus(athleteId, bikeId, active) {
      return this.http.post(environment.API_ENDPOINT + `/athletesvcs/athlete/${athleteId}/bikes/${bikeId}/activate?active=${active}`, {})
        .toPromise();
    }

    changePassword(oldPassword, newPassword): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/changepassword',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    newPassword: newPassword,
                    newPasswordRepeat: newPassword,
                    oldPassword: oldPassword
                }
            }).pipe(catchError(res => observableThrowError(res)));
    }

    updateContactInfo(contact): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/sub/updatecontactinfo',
            {
                header: { accessToken: this.accessToken }, body: contact
            }).pipe(catchError(res => observableThrowError(res)));
    }


    tsp(): any {
        return this.http.post(environment.API_ENDPOINT + '/athletesvcs/athlete/dash/bottomsection',
            {
                header: { accessToken: this.accessToken }, body: {
                    athleteId: this.profileId,
                    athleteProfileId: this.profileId
                }
            }).pipe(catchError(res => observableThrowError(res)));

    }

    profile(): any {
        return (this.http.get(environment.API_ENDPOINT + '/athletesvcs/athlete/user/profile') as Observable<any>).pipe(tap(({header, body}) => {
                if (header.status === 'success' && body && body.response) {
                    localStorage.athleteProfile = JSON.stringify(body.response.athleteProfile);
                }
            }),
            catchError(res => observableThrowError(res)),);
    }

    public saveProfile(profile: any): Observable<Response> {
        this._savingProfile = true;
        const profileToUpdate = Object.assign({}, profile);
        if (profileToUpdate.swimStartDate) {
            profileToUpdate.swimStartDate = moment(profileToUpdate.swimStartDate).format('l');
        }
        if (profileToUpdate.runStartDate) {
            profileToUpdate.runStartDate = moment(profileToUpdate.runStartDate).format('l');
        }
        if (profileToUpdate.dob) {
            profileToUpdate.dob = moment(profileToUpdate.dob).format('l');
        }
        if (profile.bikeStartDate) {
            profileToUpdate.bikeStartDate = moment(profileToUpdate.bikeStartDate).format('l');
        }
        return this.save(profileToUpdate).pipe(tap(() => this._savingProfile = false));
    }

    public save(profile: any): Observable<Response> {
        return this.globalService.httpPost(SAVE_ATHLETE_PROFILE_API, profile);
    }

    async dontHaveDevice(athleteId: number): Promise<any> {
        await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/device/devicesCheck`, {
            header: { accessToken: this.accessToken },
            body: { athleteId, deviceDisplay: 1 }
        }).toPromise();
    }

    async appDownloadDismissed(): Promise<any> {
        await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/profile/${this.profileId}/download-message-dismissed`, {
            header: { accessToken: this.accessToken }
        }).toPromise();
    }

    async noScheduledRace(athleteId: number): Promise<any> {
        await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/season/noScheduledRace`, {
            header: { accessToken: this.accessToken },
            body: { athleteId, noScheduledRace: 1 }
        }).toPromise();
    }

    async getCda(athleteId: number, helmetType: string, bikePosition: number, bikeWeight: string): Promise<any> {
        const res: any = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/user/cda`, {
            header: { accessToken: this.accessToken },
            body: { athleteId, helmetType, bikePosition, bikeWeight },
        }).toPromise();
        return res.body.response.cda as string;
    }

    async restartTrial(): Promise<any> {
        const res = await this.http.post(`${environment.API_ENDPOINT}/athletesvcs/athlete/sub/${this.profileId}/restart-testdrive`, {
            header: { accessToken: this.accessToken }
        }).toPromise();
        return res;
    }

 }
