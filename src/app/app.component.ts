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
      const { scrollTop, offsetHeight } = document.documentElement;
      const { innerHeight } = window;
      this.windowScrolled = Math.round(scrollTop) + innerHeight > (offsetHeight / 2);
    });
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
