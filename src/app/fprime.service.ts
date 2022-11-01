import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FprimeService {
  public energy = [5000, 12000, 13000, 20000];
  public f1 = [-0.09144, -2.51, -2.8029, 0.15293];
  public f2 = [2.6123, 0.55047, 3.6336, 1.7712];
  public f1Data: { x: number, y: number }[] = [];
  public f2Data: { x: number, y: number }[] = [];

  constructor() {
    for (let i = 0; i < this.energy.length; i++) {
      this.f1Data.push({ x: this.energy[i], y: this.f1[i] });
      this.f2Data.push({ x: this.energy[i], y: this.f2[i] });
    }
  }
}
