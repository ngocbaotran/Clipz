import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  _title = 'Page not found';
  _description = `Looks like the page you're looking for is gone or doesn't exist.`;

  constructor() { }

  @Input()
  set title(value: string) {
    if (value) {
      this._title = value;
    }
  }

  get title() {
    return this._title;
  }

  @Input()
  set description(value: string) {
    if (value) {
      this._description = value;
    }
  }

  get description() {
    return this._description;
  }

  ngOnInit(): void {
  }

}
