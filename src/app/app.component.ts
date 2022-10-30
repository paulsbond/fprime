import { Component } from '@angular/core';
import { ElementService } from './element.service';

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
  constructor(public element: ElementService) { }

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
