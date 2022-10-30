import { Component } from '@angular/core';
import { ElementService } from './element.service';
import { ChartConfiguration, ChartOptions } from "chart.js";
import { FprimeService } from './fprime.service';

const hc = 12398.4197386209;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public wavelength = 0.9795;
  public energy = Math.round(hc / this.wavelength);
  public search: string = "";

  public chartData: ChartConfiguration<'line'>['data'] = {
    labels: this.fprime.energy,
    datasets: [
      {
        data: this.fprime.f1,
        label: "F'",
        tension: 0.5,
        borderColor: '#2f5cb8',
      },
      {
        data: this.fprime.f2,
        label: 'F"',
        tension: 0.5,
        borderColor: '#2f5cb8',
      }
    ]
  };
  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { point: { radius: 0 } },
  };
  public chartLegend = false;

  constructor(public element: ElementService, private fprime: FprimeService) { }

  wavelengthChanged(wavelength: number) {
    this.wavelength = wavelength;
    this.energy = Math.round(hc / wavelength);
  }

  energyChanged(energy: number) {
    this.energy = energy;
    this.wavelength = +(hc / energy).toFixed(4);
  }

  searchChanged() {
    const element = this.element.list.find(x => x.label == this.search);
    if (element) {
      element.selected = true;
      this.search = "";
    }
  }

  get selected() { return this.element.list.filter(x => x.selected); }
}
