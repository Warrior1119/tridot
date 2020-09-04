import { Injectable } from '@angular/core';



@Injectable()

export  class SeasonZoneSharedDataService {
  private selectedParam: string
  constructor(
    ) { }
getSelectedParam(){
return this.selectedParam;
}
setSelectedParam(param){
this.selectedParam=param;
}
}
