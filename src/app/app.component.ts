import { Component, OnInit } from '@angular/core';

import { AuthService } from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  windowScrolled = false;

  constructor(
    public auth: AuthService
  ) {
  }

  ngOnInit() {
    window.addEventListener('scroll', () => {
      this.windowScrolled = this.windowScrolled = window.pageYOffset > 450;
    });
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
