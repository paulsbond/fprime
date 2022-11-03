import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Element, elements } from './elements';
import { Chart } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import zoomPlugin from 'chartjs-plugin-zoom';
import { BaseChartDirective } from 'ng2-charts';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChartConfiguration, ChartDataset } from "chart.js";

declare const Module: any;
const hc = 12398.4197386209;
Chart.register(annotationPlugin, zoomPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public search: string = "";
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
            xMin: 12398,
            xMax: 12398,
            borderColor: "#777",
          }
        ]
      },
      tooltip: { enabled: false },
      zoom: {
        limits: {
          x: { min: 0, max: 25000 },
          y: { min: 'original', max: 'original' },
        },
        pan: { enabled: true },
        zoom: {
          drag: { enabled: true, modifierKey: 'ctrl' },
          pinch: { enabled: true },
          wheel: { enabled: true },
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
  public chartLegend = false;
  public theme: 'dark' | 'light' = 'dark';
  private _wavelength = 1;
  private _energy = 12398;
  private energySubject = new Subject<number>();
  private colors = [
    "#3366cc",
    "#dc3912",
    "#ff9900",
    "#109618",
    "#990099",
  ];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public get wavelength() { return this._wavelength; }
  public set wavelength(wavelength: number) {
    const energy = Math.round(hc / wavelength);
    this.set_wavelength_and_energy(wavelength, energy);
  }
  public get energy() { return this._energy; }
  public set energy(energy: number) {
    const wavelength = +(hc / energy).toFixed(4);
    this.set_wavelength_and_energy(wavelength, energy);
  }
  private set_wavelength_and_energy(wavelength: number, energy: number) {
    if (energy > 0 && energy <= 25000) {
      this._wavelength = wavelength;
      this._energy = energy;
      this.energySubject.next(energy);
    }
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.energySubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(this.energyChanged);
  }

  searchInput() {
    const element = elements.find(x => x.label == this.search);
    if (element) {
      this.select(element);
      this.search = "";
    }
  }

  energyChanged = () => {
    this.chartOptions.plugins.annotation.annotations[0].xMin = this.energy;
    this.chartOptions.plugins.annotation.annotations[0].xMax = this.energy;
    this.updateChartData();
  }

  chartClicked = (event: any) => {
    const energy = event.event.chart.scales.x.getValueForPixel(event.event.x);
    this.energy = Math.round(energy);
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
    if (element.color) this.colors.unshift(element.color);
    element.color = undefined;
    this.selected = this.selected.filter(e => e !== element);
    this.updateChartData();
  }

  public toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle("light");
  }

  private updateChartData() {
    this.chartData.datasets = [];
    this.selected.forEach((element) => {
      this.chartData.datasets = this.chartData.datasets.concat(this.datasets(element));
    });
    this.chart?.update();
    this.chart?.ngOnChanges({});
    this.changeDetectorRef.detectChanges();
  }

  private datasets(element: Element): ChartDataset<'scatter'>[] {
    const energies = new Module.VectorDouble();
    for (let energy = 0; energy <= 25000; energy += 25) {
      energies.push_back(energy);
    }
    const fprimes = Module.fprimes(element.z, energies);
    const datasets: ChartDataset<'scatter'>[] = [
      { data: [], borderColor: element.color, backgroundColor: element.color },
      { data: [], borderColor: element.color, backgroundColor: element.color },
    ];
    for (let i = 0; i < fprimes.size(); i++) {
      datasets[0].data.push({ x: energies.get(i), y: fprimes.get(i).fp });
      datasets[1].data.push({ x: energies.get(i), y: fprimes.get(i).fpp });
    }
    return datasets;
  }
}
