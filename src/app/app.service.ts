import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public viewState = {
    isOverLoad: false
  };

  constructor() { }

  public overload(isOverLoad: boolean = true): void {
    this.viewState.isOverLoad = isOverLoad;
  }
}
