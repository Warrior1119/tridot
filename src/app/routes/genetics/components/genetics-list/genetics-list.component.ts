import { Component, Input } from '@angular/core';
import { Animations } from '../../../../athlete-portal/constants/animations';

@Component({
  selector: 'genetics-list',
  templateUrl: './genetics-list.component.html',
  styleUrls: ['./genetics-list.component.scss'],
  animations: [Animations.NgIf.ngIfExpandHeight]
})
export class GeneticsListComponent {

  @Input() genetics;
  expandedRow;

  getActiveGene(gene) {
    return gene.genetics.find(x => x.isMemberResult);
  }

  isBarActive(gene, currentGene, pos: number) {
    return currentGene && currentGene.result.charAt(pos) === (gene.genetics[2] && gene.genetics[2].result.charAt(0));
  }

}
