import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AuthService } from "./services/auth.service";
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentChecked {
  windowScrolled = false;

  constructor(
    public auth: AuthService,
    public appService: AppService,
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    window.addEventListener('scroll', () => {
      this.windowScrolled = this.windowScrolled = window.pageYOffset > 450;
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
