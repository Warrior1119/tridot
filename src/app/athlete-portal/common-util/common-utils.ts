import { ConfirmationModalComponent } from '../common-components/confirmation-modal/confirmation-modal.component';
import { DEFAULT_ERROR_MESSAGE } from '../constants/constants';
import { BsModalRef } from 'ngx-bootstrap/modal';
export class CommonUtils {
    public static isAtleteSubscriptionPremium(athleteProfile: any): boolean {
        if (athleteProfile && athleteProfile.subscription) {
            const subscritpionLevel = athleteProfile.subscription.toLowerCase();
            return subscritpionLevel === 'select' || subscritpionLevel === 'premium' || subscritpionLevel === 'premium2017';
        }
        return false;
    }

    public static getAtleteAssignedCoachId(athleteProfile: any): number {
        if (athleteProfile && athleteProfile.coach) {
            return athleteProfile.coach.coachId;
        }
        return -1;
    }

    public static validateWieght(measurementSystem: string, weight: string, weightLabel = 'weight'): string {
        let weightError = null;
        if (!weight) {
            weightError = 'Please enter your ' + weightLabel + '.';
        } else {
            if (measurementSystem === 'standard') {
                weightError = CommonUtils.validateStandardWeight(weight, weightError);
            } else if (measurementSystem === 'metric') {
                weightError = CommonUtils.validateMetricWeight(weight, weightError);
            }
        }
        return weightError;
    }

    private static validateMetricWeight(weight: string, weightError: any) {
        if (parseInt(weight, 10) < 40 || parseInt(weight, 10) > 180) {
            weightError = 'Please enter a weight between 40 kg and 180 kg';
        }
        return weightError;
    }

    private static validateStandardWeight(weight: string, weightError: any) {
        if (parseInt(weight, 10) < 90 || parseInt(weight, 10) > 400) {
            weightError = 'Please enter a weight between 90 lbs and 400 lbs';
        }
        return weightError;
    }
    public static modalMessage(modalTitle, message, modalRef, modalType, modalService, successBtnTxt, cancelBtnEnabled = false) {
        if (modalType == 'loading') {
            modalRef=modalService.show(ConfirmationModalComponent, {
              backdrop: 'static',
              keyboard: false,
            });
        } else {
            modalRef = modalService.show(ConfirmationModalComponent);
        }
        modalRef.content.message = message;
        modalRef.content.displayModal = modalRef;
        modalRef.content.modalType = modalType;
        modalRef.content.successBtnTxt = successBtnTxt;
        modalRef.content.modalTitle = modalTitle;
        modalRef.content.cancelBtnEnabled = cancelBtnEnabled;
        return {status: true, modalRef: modalRef, modalService: modalService, title: "Something went wrong. Please try again later."};
    }

    public static defaultErrorModalMessage(modalService, erroMsg = DEFAULT_ERROR_MESSAGE): BsModalRef {
        const modalRef = modalService.show(ConfirmationModalComponent);
        modalRef.content.message = erroMsg;
        modalRef.content.displayModal = modalRef;
        modalRef.content.modalType = 'error';
        modalRef.content.successBtnTxt = 'DISMISS';
        modalRef.content.modalTitle = 'ERROR';
        modalRef.content.cancelBtnEnabled = false;
        return modalRef;
    }

    public static defaultSuccessModalMessage(modalService, message: string): BsModalRef {
        const modalRef = modalService.show(ConfirmationModalComponent);
        modalRef.content.message = message;
        modalRef.content.displayModal = modalRef;
        modalRef.content.modalType = 'success';
        modalRef.content.successBtnTxt = 'DISMISS';
        modalRef.content.modalTitle = 'SUCESS';
        modalRef.content.cancelBtnEnabled = false;
        return modalRef;
    }

    public static isKeyAPI(url: string) {
        return url.includes("schedule/dayDetails") ||
                url.includes("schedule/multiweek") ||
                url.includes("season/plans") || 
                url.includes("coach/coachAthletes");
    }

    public static toLowerCase(value: string): string {
        return value ? value.toLowerCase() : '';
    }
}
