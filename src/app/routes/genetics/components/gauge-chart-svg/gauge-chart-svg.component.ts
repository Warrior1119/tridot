import { Component, Input } from '@angular/core';

@Component({
  selector: 'gauge-chart-svg',
  templateUrl: './gauge-chart-svg.component.html',
  styleUrls: ['./gauge-chart-svg.component.scss']
})
export class GaugeChartSvgComponent {

  @Input() chartType: string;
  @Input() title: string;
  @Input() result: string|number;

  get upperCase() {
    return typeof this.result === 'string' ? this.result.toUpperCase() : this.result;
  }

  get lowerCase() {
    return typeof this.result === 'string' ? this.result.toLowerCase() : this.result;
  }

  get closestPercentage() {
    return this.getClosestPercentage(this.result);
  }

  get filename() {
    if (this.chartType.toLowerCase() === 'power') {
      return `power-${this.getClosestPercentage(this.result)}.svg`;
    }
    return `${this.chartType.toLowerCase()}-${this.sanitizeResult(this.result)}.svg`;
  }

  private getClosestPercentage(input) {
    const bounds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    for (let i = 1; i < bounds.length; i++) {
      const lowerBound = bounds[i - 1];
      const upperBound = bounds[i];
      if (lowerBound <= input && input < upperBound) {
        return lowerBound;
      }
    }
    return bounds[0];
  }

  private sanitizeResult(input: string|number) {
    if (typeof input === 'number') {
      return input.toFixed(0);
    }
    if (input.match(/(fast|high)/i)) {
        return input.match(/very/i) ? 'very-high' : 'high';
    }
    if (input.match(/(slow|low)/i)) {
        return input.match(/very/i) ? 'very-low' : 'low';
    }
    if (input.match(/(normal|medium|moderate|middle)/i)) {
        return 'medium';
    }
    return input;
  }
}
