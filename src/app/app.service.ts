import { Injectable } from '@angular/core';

import { first } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isInAdminModule: boolean = false;
  public viewState = {
    isOverLoad: false
  };

  constructor(
    private authService: AuthService,
    private modalService: ModalService
  ) { }

  public overload(isOverLoad: boolean = true) {
    this.viewState.isOverLoad = isOverLoad;
  }

  async checkAuthentication(): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated$?.pipe(first()).toPromise();

    if (!isAuthenticated) {
      this.modalService.toggleModal('authentication');
    }

    return !!isAuthenticated;
  }
}
