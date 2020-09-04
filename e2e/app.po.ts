import { browser, by, element } from 'protractor';
import { environment } from '../src/environments/environment';

export class AppPage {
  navigateTo() {
    return browser.get(environment.E2E_APP_URL);
  }

  getRegisterForFreeBtnTag(){    
    return element(by.linkText('Register for Free')).getTagName();

  }

  getRegisterForFreeLink(){
    return element(by.linkText('Register for Free')).click();
  }
  getButton() {
    return element(by.id('register')).click();
  }
  getLoginTagName(){
    return element(by.linkText('Login')).getTagName();
  }

  getEmailField(){
    return element(by.id('exampleInputEmail1'))
  }
  getPasswordField(){
    return element(by.className('form-control ng-untouched ng-pristine ng-invalid'))
  }

  getRegisterForFreeBtn(){
    return element(by.buttonText('Register for Free'))
  }

  getLetsGetStartedText(){
    return element(by.className('display-1 text-darker text-uppercase page-heading')).getText();
  }
  getIamManBtnText(){
    return element(by.buttonText("I'm a man"));
  }

  getFullNameTextField(){
    return element(by.css("input[formControlName=name]"))
  }

  getBasicInfoH1(){
    return element(by.className("display-1 text-darker text-uppercase page-heading"));
  }

  getDobField(){
    return element(by.id("exampleInputtext1"));
  }

  getHeightField(){
    return element(by.css("input[formcontrolname=height"));
  }
  getWeightField(){
    return element(by.css("input[formcontrolname=weight"));
  }

  getContinueBtn(){
    return element(by.className("btn btn-lg btn-block btn-info text-md"));
  }

  getPerformanceLevelText(){
    return element(by.className("text-drk mb-4"));
  }

  getPerformanceLevelBtn(){
    return element(by.className("btn btn-lg btn-block btn-info text-md"));
  }

  getRaceDistanceText(){
    return element(by.className("display-1 text-darker text-uppercase page-heading"));
  }

  getBtnInRaceDistancePopUp(){
    return element(by.className("btn btn-lg btn-block btn-info text-md"));
  }

  getStartUsingTridotText(){
    return element(by.className("display-1 text-darker text-uppercase page-heading"));
  }

  getResultsNowBtn(){
    return element(by.className("btn btn-lg btn-block btn-primary text-md"));
  }
  getSwimFitnessProfileText(){
    return element(by.className("swim-color"));
  }  

  getTimeField(){
    return element(by.css("input[formcontrolname=swimDistanceTime]"))
  }
  getYearsField(){
    return element(by.css("input[formcontrolname=swimAgeYears]"));
  }
  getMonthsField(){
    return element(by.css("input[formcontrolname=swimAgeMonths]"));
  }
  getWeeklySwimHoursField(){
    return element(by.css("input[formcontrolname=weeklySwimHours]"));
  }
  getLongestSwimSession(){
    return element(by.css("input[formcontrolname=longestSwimSession]"));
  }

  getSwimProfileContinueBtn(){
    return element(by.className("btn-primary swim-bg btn btn-lg text-md btn-block"));
  }

  getSwimDistanceDropDown(){             

          element.all(by.tagName('option'))   
                .then(function(options){                                  
                  options[1].click();
                });          
    };
    
    getTimeFieldInBikeProfile(){
      return element(by.css('input[formcontrolname="time"'))
    }
    
    getYearsFieldInBikeProfile(){
      return element(by.css('input[formcontrolname="years"'));
    }

    getMonthsFieldInBikeProfile(){
      return element(by.css('input[formcontrolname="months"'));
    }

    getHoursPerWeekFieldInBikeProfile(){
      return element(by.css('input[formcontrolname="hoursPerWeek"'));
    }

    getLongestWeeklySessionFieldInBikeProfile(){
      return element(by.css('input[formcontrolname="longestWeeklySession"'));
    }

    getContinueBtnInBikeProfile(){
      return element(by.className("btn-primary bike-bg btn btn-lg text-md btn-block"));
    }

    getTimeFieldInRunFitnessProfile(){
      return element(by.css('input[formcontrolname="time"'));
    }

    getYearsFieldInRunFitnessProfile(){
      return element(by.css('input[formcontrolname="years"'));
    }
    getMonthsFieldInRunFitnessProfile(){
      return element(by.css('input[formcontrolname="months"'));
    }

    getHoursPerWeekFieldInRunProfile(){
      return element(by.css('input[formcontrolname="hoursPerWeek"'));
    }
    getLongestWeeklySessionFieldInRunProfile(){
      return element(by.css('input[formcontrolname="longestWeeklySession"'));
    }

    getContinueBtnInRunProfile(){
      return element(by.className("btn-primary run-bg btn btn-lg text-md btn-block"));
    }

    getConfidenceLevelDropDown(){      
      element.all(by.tagName('option'))   
                .then(function(options){                     
                  options[1].click();
                });        
    }

    getStrokeRateField(){
      return element(by.css('input[formcontrolname="strokeRate"]'))
    }

    getHowDrivenDropDown(text){
               
        return element(by.cssContainingText('option', text)).click();      
    }

    selectYesRadioBtns(){         
    
      element(by.css('label[for="inlineRadio1"]')).click();      
      element(by.css('label[for="inlineRadio3"]')).click();          
      element(by.css('label[for="inlineRadio5"]')).click();      
      element(by.css('label[for="inlineRadio7"]')).click();      
      element(by.css('label[for="inlineRadio9"]')).click();      
      element(by.css('label[for="inlineRadio11"]')).click();      
      element(by.css('label[for="inlineRadio13"]')).click();     

    }

    getCompleteProfileBtn(){
      return element(by.className("btn-primary swim-bg btn btn-lg text-md btn-block"));
    }

    getNotReferredByCoachBtn(){
      return element(by.className("btn btn-lg btn-secondary btn-block text-md mt-0"));
    }

    getDismissBtn(){
      return element(by.buttonText("Dismiss"));
    }
    getCountryDropDown(){
      return element.all(by.tagName('option'))   
                .then(function(options){                     
                  options[1].click();
                });        
    }

}
