import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserProfileService } from '../../user-profile.service';
import { LocalstorageService } from './../../../../common-services/localstorage.service';

@Component({
  selector: 'app-athlete-bio',
  templateUrl: './athlete-bio.component.html',
  styleUrls: ['./athlete-bio.component.scss']
})
export class AthleteBioComponent implements OnInit {
  @Input() profile;
  @Output() save = new EventEmitter();
  public loading = false;
  public originalProfile;

  bEdit = false;
  constructor(private userProfileService: UserProfileService,
              private localstorageService: LocalstorageService,) { }

  update(profile) {
    this.save.next(profile);
  }

  getEditButton() {
    return this.bEdit ? 'Cancel' : 'Edit Bio';
  }

  ngOnInit() {
    this.originalProfile = Object.assign({}, this.profile);
  }

  public cancel(): void {
    this.bEdit = !this.bEdit;
    this.profile = Object.assign({}, this.originalProfile);
  }

  public updateProfile(profile): void {
    this.loading = true;
    this.saveProfile(profile);
  }

  public saveProfile(profile): void {
    this.userProfileService.saveProfile(profile).subscribe((res) => {
      localStorage.athleteProfile = JSON.stringify(profile);
      this.profile = this.localstorageService.getAthleteProfileIfExists();
      this.originalProfile = this.profile;
      this.loading = false;
      this.bEdit = false;
    });
  }

  public isSaveDisabled(): boolean {
    return this.loading;
  }
}
