import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AuthService } from "./services/auth.service";
import { AppService } from './app.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModalService } from './services/modal.service';

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
    private router: Router,
    private modalService: ModalService
  ) {
  }

  ngOnInit() {
    this.modalService.register('authentication');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: RouterEvent & NavigationEnd) => {
      this.appService.isInAdminModule = event.url.includes('/admin');
    });


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
