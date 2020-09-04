import { Component, OnInit } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { LocalstorageService } from "../../../athlete-portal/common-services/localstorage.service";
import { DEFAULT_PROFILE_PICTURE } from "../../../athlete-portal/constants/constants";
import { CoachPhotosService } from "./coach-photos.service";

@Component({
  selector: 'app-coach-photos',
  templateUrl: './coach-photos.component.html',
  styleUrls: ['./coach-photos.component.scss']
})
export class CoachPhotosComponent implements OnInit {
  public photos: any[];

  public emptyPhoto = {
    new: true,
    url: 'assets/img/svg/icons/plus-add.svg',
  };
  public loading: boolean = false;
  public deletingItem: any = null;

  private photoCount = 6;
  private currentEditingPhoto: number;
  private profile: any;

  constructor(
    private coachPhotosService: CoachPhotosService,
    private localstorageService: LocalstorageService,
  ) { }

  public ngOnInit() {
    this.profile = this.localstorageService.getCoachProfileIfExists();

    this.refresh();
  }

  public onFileChanged(event, fileRef: HTMLInputElement) {
    this.loading = true;
    const [ file ] = event.target.files;

    this.coachPhotosService.postPhoto(this.profile.coachId, this.currentEditingPhoto + 1, file)
      .toPromise()
      .then(() => {
        this.refresh();
        fileRef.value = null;
        this.loading = false;
      }).catch(() => {
        fileRef.value = null;
        this.loading = false;
      });
  }

  public editPhoto(index: number) {
    this.currentEditingPhoto = index;
  }

  public setDeleting(i: number) {
    this.deletingItem = i;
  }

  public deletePhoto(id) {
    this.loading = true;
    this.coachPhotosService.deletePhoto(this.profile.coachId, id)
      .toPromise()
      .then(() => {
        this.refresh();
        this.loading = false;
        this.setDeleting(null);
      }).catch(() => {
      this.loading = false;
    });
  }

  private refresh() {
    this.coachPhotosService.getPhotos(this.profile.coachId)
      .toPromise()
      .then((response) => {
        this.initPhotos(response);
      });
  }

  private toPhotoModel(photoFromServer) {
    return {
      id: photoFromServer.id,
      url: environment.API_ENDPOINT + photoFromServer.medium,
    };
  }

  private initPhotos(photosFromServer: any[]) {
    const tempPhotos = [];
    const emptyFrom = photosFromServer.length;

    for (let i = 0; i < emptyFrom; i++) {
      tempPhotos.push(this.toPhotoModel(photosFromServer[i]));
    }

    for (let i = emptyFrom; i < this.photoCount; i++) {
      tempPhotos.push(this.emptyPhoto);
    }

    this.photos = tempPhotos;
  }
}
