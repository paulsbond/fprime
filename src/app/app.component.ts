import { Component } from '@angular/core';
import { ElementService } from './element.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public element: ElementService) { }

  get selected() { return this.element.list.filter(x => x.selected); }
}
