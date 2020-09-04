import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { TextEncodeDecode } from "../../../athlete-portal/common-model/textEncodeDecode.modal";
import { LocalstorageService } from "../../../athlete-portal/common-services/localstorage.service";
import { CoachPortalService } from "../../coach-portal.service";

@Component({
  selector: "app-coach-info",
  templateUrl: "./coach-info.component.html",
  styleUrls: ["./coach-info.component.scss"],
})
export class CoachInfoComponent implements OnChanges {
  @Input() public coachProfile: any;
  @Output() public resetProfile: EventEmitter<void> = new EventEmitter<void>();
  @Output() public saveProfile: EventEmitter<void> = new EventEmitter<void>();
  public editMode: boolean = false;
  public loading: boolean = false;

  public experienceText: any;
  public aboutText: any;
  public coachingPhilosophyText: any;
  public backgroundText: any;
  public qualificationsText: any;

  constructor(
    private localstorageService: LocalstorageService,
    private coachService: CoachPortalService,
    private textEncodeDecode: TextEncodeDecode,
  ) { }

  public ngOnChanges(): void {
    this.experienceText = this.textEncodeDecode.getDecodedText(this.coachProfile.experience);
    this.experienceText = this.replaceBrWithNewLine(this.experienceText);

    this.aboutText = this.textEncodeDecode.getDecodedText(this.coachProfile.about);
    this.aboutText = this.replaceBrWithNewLine(this.aboutText);

    this.coachingPhilosophyText = this.textEncodeDecode.getDecodedText(this.coachProfile.coachingPhilosophy);
    this.coachingPhilosophyText = this.replaceBrWithNewLine(this.coachingPhilosophyText);

    this.backgroundText = this.textEncodeDecode.getDecodedText(this.coachProfile.background);
    this.backgroundText = this.replaceBrWithNewLine(this.backgroundText);

    this.qualificationsText = this.textEncodeDecode.getDecodedText(this.coachProfile.qualifications);
    this.qualificationsText = this.replaceBrWithNewLine(this.qualificationsText);
  }

  public enableEditMode() {
    this.editMode = true;
  }

  public disableEditMode() {
    this.editMode = false;
  }

  public cancel() {
    this.resetProfile.emit();
    this.disableEditMode();
  }

  public save() {
    this.loading = true;

    this.coachProfile.experience = this.textEncodeDecode.getEncodedText(this.experienceText);
    this.coachProfile.about = this.textEncodeDecode.getEncodedText(this.aboutText);
    this.coachProfile.coachingPhilosophy = this.textEncodeDecode.getEncodedText(this.coachingPhilosophyText);
    this.coachProfile.background = this.textEncodeDecode.getEncodedText(this.backgroundText);
    this.coachProfile.qualifications = this.textEncodeDecode.getEncodedText(this.qualificationsText);

    this.coachService.saveCoachProfile(this.coachProfile).toPromise().then(() => {
      this.saveProfile.emit();
      this.loading = false;
      this.disableEditMode();
    }).catch((error) => {
      this.loading = false;
      console.log(error);
    });
  }

  public getEncodedText(notes) {
    if (notes) {
      return notes.replace(/\n/g, '<br />');
    }
    return notes;
  }

  private replaceBrWithNewLine(notes){
    if (notes) {
      return notes.replace(/<br \/>/g, '\n');
    }
    return notes;
  }
}
