import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages';
import { AdminComponent } from './pages';
import { UserComponent } from './pages';

const routes: Routes = [
  {
    path: '', component: AdminComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'user', component: UserComponent },
    ]
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
