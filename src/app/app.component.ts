import { ApplicationRef, Component, ViewChild } from '@angular/core';
import { Element, elements } from './elements';
import { Chart } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { BaseChartDirective } from 'ng2-charts';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChartConfiguration, ChartDataset } from "chart.js";

declare const Module: any;
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
  public elements: Element[] = elements;
  public selected: Element[] = [];
  public chartData: ChartConfiguration<'scatter'>['data'] = { datasets: [] };
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
  private _energy = Math.round(hc / this.wavelength);
  private energySubject = new Subject<number>();
  private colors = [
    "rgb(100, 143, 255)",
    "rgb(120, 94, 240)",
    "rgb(220, 38, 127)",
    "rgb(254, 97, 0)",
    "rgb(255, 176, 0)",
  ];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public get energy() { return this._energy; }

  public set energy(value: number) {
    this._energy = value;
    this.energySubject.next(value);
  }

  constructor(private appRef: ApplicationRef) {
    Module['onRuntimeInitialized'] = () => {
      const selenium = elements.find(x => x.symbol == "Se");
      if (selenium) this.select(selenium);
      appRef.tick();
    };
    this.energySubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(this.energyChanged);
  }

  wavelengthInput() {
    this.energy = Math.round(hc / this.wavelength);
  };

  energyInput() {
    this.wavelength = +(hc / this.energy).toFixed(4);
  }

  searchInput() {
    const element = elements.find(x => x.label == this.search);
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

  public f1(z: number, energy: number): number {
    return Module.fprime(z, energy).fp;
  }

  public f2(z: number, energy: number): number {
    return Module.fprime(z, energy).fpp;
  }

  public select(element: Element) {
    element.color = this.colors.shift();
    this.selected.push(element);
    this.selected.sort((a, b) => a.z - b.z);
    this.updateChartData();
  }

  public deselect(element: Element) {
    if (element.color) this.colors.push(element.color);
    element.color = undefined;
    this.selected = this.selected.filter(e => e !== element);
    this.updateChartData();
  }

  private updateChartData() {
    this.chartData.datasets = [];
    this.selected.forEach((element) => {
      this.chartData.datasets = this.chartData.datasets.concat(this.datasets(element));
    });
    this.chart?.update();
  }

  private datasets(element: Element): ChartDataset<'scatter'>[] {
    const energies = new Module.VectorDouble();
    for (let energy = 5000; energy <= 20000; energy += 50) {
      energies.push_back(energy);
    }
    const fprimes = Module.fprimes(element.z, energies);
    const datasets: ChartDataset<'scatter'>[] = [
      { data: [], borderColor: element.color },
      { data: [], borderColor: element.color },
    ];
    for (let i = 0; i < fprimes.size(); i++) {
      datasets[0].data.push({ x: energies.get(i), y: fprimes.get(i).fp });
      datasets[1].data.push({ x: energies.get(i), y: fprimes.get(i).fpp });
    }
    return datasets;
  }
}
