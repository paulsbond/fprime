import { Component, ViewChild } from '@angular/core';
import { Element, ElementService } from './element.service';
import { Chart, ChartConfiguration } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { FprimeService } from './fprime.service';
import { BaseChartDirective } from 'ng2-charts';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

const hc = 12398.4197386209;
Chart.register(annotationPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public search: string = "";
  public wavelength = 0.9795;
  private _energy = Math.round(hc / this.wavelength);
  private energySubject = new Subject<number>();
  private colors = [
    "rgb(100, 143, 255)",
    "rgb(120, 94, 240)",
    "rgb(220, 38, 127)",
    "rgb(254, 97, 0)",
    "rgb(255, 176, 0)",
  ];

  get energy() { return this._energy; }

  set energy(value: number) {
    this._energy = value;
    this.energySubject.next(value);
  }

  constructor(public element: ElementService, private fprime: FprimeService) {
    const selenium = this.element.list.find(x => x.symbol == "Se");
    if (selenium) this.select(selenium);
    this.energySubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(this.energyChanged);
  }

  public chartData: ChartConfiguration<'scatter'>['data'] = {
    datasets: [
      {
        data: this.fprime.f1Data,
        borderColor: '#648FFF',
      },
      {
        data: this.fprime.f2Data,
        borderColor: '#648FFF',
      }
    ]
  };

  public chartOptions: any = {
    animation: { duration: 0 },
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
      },
      tooltip: { enabled: false }
    }
  };
  public chartLegend = false;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  wavelengthInput() {
    this.energy = Math.round(hc / this.wavelength);
  };

  energyInput() {
    this.wavelength = +(hc / this.energy).toFixed(4);
  }

  searchInput() {
    const element = this.element.list.find(x => x.label == this.search);
    if (element) {
      this.select(element);
      this.search = "";
    }
  }

  energyChanged = (energy: number) => {
    if (energy >= 5000 && energy <= 20000) {
      this.chartOptions.plugins.annotation.annotations[0].xMin = this.energy;
      this.chartOptions.plugins.annotation.annotations[0].xMax = this.energy;
      this.chart?.update();
      this.chart?.ngOnChanges({});
    }
  }

  select(element: Element) {
    element.selected = true;
    element.color = this.colors.shift();
  }

  deselect(element: Element) {
    if (element.color) this.colors.push(element.color);
    element.selected = false;
    element.color = undefined;
  }

  get selected() { return this.element.list.filter(x => x.selected); }
}
