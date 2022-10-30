import { Component } from '@angular/core';
import { ElementService } from './element.service';
import { Chart, ChartConfiguration } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { FprimeService } from './fprime.service';

const hc = 12398.4197386209;
Chart.register(annotationPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public wavelength = 0.9795;
  public energy = Math.round(hc / this.wavelength);
  public search: string = "";

  public chartData: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        data: this.fprime.f1Data,
        borderColor: '#2f5cb8',
      },
      {
        data: this.fprime.f2Data,
        borderColor: '#2f5cb8',
      }
    ]
  };

  public chartOptions: any = {
    showLine: true,
    pointRadius: 0,
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { bounds: 'data' } },
    plugins: {
      annotation: {
        annotations: [
          {
            type: "line",
            xMin: 12658,
            xMax: 12658,
            borderColor: "#777",
          }
        ]
      }
    }
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
