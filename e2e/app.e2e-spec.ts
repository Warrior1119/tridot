import { AppPage } from './app.po';
import { browser } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('tridot App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();    
  });

  it('should display register for free', () => {   
    page.navigateTo(); 
    expect(page.getRegisterForFreeBtnTag()).toBe('a');
  });


  it('click register for free', ()=>{    
    page.getRegisterForFreeLink();    
    expect(page.getLoginTagName()).toBe('a');
  });
  it('fill the registration form', ()=>{    
    page.getEmailField().sendKeys('test' + Math.random() + '@tridot.com');
    page.getEmailField().sendKeys(protractor.Key.ENTER);
    page.getPasswordField().sendKeys('Test@1234');
    
    page.getRegisterForFreeBtn().click();    
    expect(page.getIamManBtnText().getText()).toBe("I'm a man");   

    
  })
  it('fill the form after clicking on I\'m man button', ()=>{
    browser.waitForAngularEnabled(false);    
    page.getFullNameTextField().sendKeys("test test");
    browser.sleep(2000);
    page.getIamManBtnText().click();
    
    browser.sleep(3000);    
    expect(page.getBasicInfoH1().isPresent()).toBe(true);    
    page.getCountryDropDown();
    page.getDobField().sendKeys("04/11/1994");
    page.getHeightField().sendKeys("152");    
    page.getWeightField().sendKeys("123");    
    page.getContinueBtn().click();

  });

  it("displays performance level pop up", ()=>{
    expect(page.getPerformanceLevelText().getText()).toBe("How would you describe your performance level?");
    page.getPerformanceLevelBtn().click();  
  });

  it("displays primary race distace pop up", ()=>{
    expect(page.getRaceDistanceText().getText()).toBe("Primary Race Distance".toUpperCase());
    page.getBtnInRaceDistancePopUp().click();
    browser.sleep(3000);

  })

  it("displays start using tridot pop up", ()=>{
    browser.sleep(3000);
    expect(page.getStartUsingTridotText().getText()).toBe("Start Using TriDot!".toUpperCase());
    page.getResultsNowBtn().click();
    browser.sleep(5000);
  })
  it('fill swim fitness profile', ()=>{        
    browser.sleep(8000);
    page.getSwimDistanceDropDown();    
    page.getTimeField().sendKeys("10:00");
    page.getYearsField().sendKeys("2");
    page.getMonthsField().sendKeys("2");
    page.getWeeklySwimHoursField().sendKeys("08:00:00")
    page.getLongestSwimSession().sendKeys("02:00:00")
    page.getSwimProfileContinueBtn().click();
    browser.sleep(4000);



  })

  it('fill bike fitness profile', ()=>{
    page.getTimeFieldInBikeProfile().sendKeys("01:00:00")
    page.getYearsFieldInBikeProfile().sendKeys("2");
    page.getMonthsFieldInBikeProfile().sendKeys("2");
    page.getHoursPerWeekFieldInBikeProfile().sendKeys("02:00:00");
    page.getLongestWeeklySessionFieldInBikeProfile().sendKeys("02:00:00");
    page.getContinueBtnInBikeProfile().click();
    browser.sleep(5000);

  })

  it('fill run fitness profile', ()=>{
    page.getTimeFieldInRunFitnessProfile().sendKeys("01:00:00");
    page.getYearsFieldInRunFitnessProfile().sendKeys("2");
    page.getMonthsFieldInRunFitnessProfile().sendKeys("2");
    page.getHoursPerWeekFieldInRunProfile().sendKeys("02:00:00");
    page.getLongestWeeklySessionFieldInRunProfile().sendKeys("02:00:00");
    page.getContinueBtnInRunProfile().click();
    browser.sleep(5000);

  });

  it('fill the swim form diagnostic', ()=>{               
    browser.actions().mouseMove(page.getCompleteProfileBtn()).perform();                    
    page.getConfidenceLevelDropDown();        
    page.getStrokeRateField().sendKeys("1.5");
    page.getHowDrivenDropDown('8');        
    page.selectYesRadioBtns();
    browser.sleep(3000);
    page.getCompleteProfileBtn().click();     
    browser.sleep(8000);

  })

  it('display coach pop', ()=>{    
    expect(page.getNotReferredByCoachBtn().getText()).toBe("Not referred by Coach");
    page.getNotReferredByCoachBtn().click();
    browser.sleep(9000);

  })

  it("display congrats pop up", ()=>{
    expect(page.getDismissBtn().getText()).toBe("Dismiss".toUpperCase());

  })  

});
