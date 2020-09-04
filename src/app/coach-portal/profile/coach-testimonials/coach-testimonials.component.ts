import { Component, Input, OnInit } from "@angular/core";
import { map } from "rxjs/operators";
import { CoachTestimonialsService } from "./coach-testimonials.service";

@Component({
  selector: "app-coach-testimonials",
  templateUrl: "./coach-testimonials.component.html",
  styleUrls: ["./coach-testimonials.component.scss"],
})
export class CoachTestimonialsComponent implements OnInit {
  public filterItems: Array<{ key: string, label: string, value: string }> = [
    { key: "pending", label: "Pending Testimonials", value: "30" },
    { key: "manage", label: "Manage Testimonials", value: "10" },
  ];

  @Input() public coachProfile: any;
  public selected: { key: string, label: string, value: string };

  public page: any;
  public loading: boolean = false;
  private _data: any[] = [];
  private oppositeValues = { pending: "10", manage: "30" };

  get data() {
    return this._data.filter((item) => !this.selected || item.statusCode === this.selected.value);
  }

  constructor(private coachTestimonialsService: CoachTestimonialsService) { }

  public ngOnInit() {
    this.selected = this.filterItems[0];

    if (this.coachProfile) {
      this.coachTestimonialsService.getTestimonials(this.coachProfile.coachId)
        .toPromise()
        .then((response) => this._data = response)
        .catch((error) => console.log(error));
    }
  }

  public filterTestimonials(fi: { key: string; label: string; value: string }) {
    if (this.selected.key === fi.key) { return; }

    this.selected = fi;
  }

  public toggleApprove(item: any) {
    this.update({ ...item, statusCode: this.oppositeValues[this.selected.key]  });
  }

  public remove(item: any) {
    this.update({ ...item, statusCode: "20"  });
  }

  private update(item) {
    this.loading = true;
    this.coachTestimonialsService.updateTestimonial(item)
      .toPromise()
      .then(() => {
        const entity = this._data.find((x: any) => x.testimonialId === item.testimonialId);
        if (entity) {
          Object.assign(entity, item);
        }

        this.loading = false;
      }).catch(() => this.loading = false);
  }
}
