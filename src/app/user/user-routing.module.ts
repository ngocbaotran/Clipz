import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileComponent } from './profile/profile.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToHome = () => redirectUnauthorizedTo('/')

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome
    },
    canActivate: [AngularFireAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
