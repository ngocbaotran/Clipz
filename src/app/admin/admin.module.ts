import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgChartsModule } from 'ng2-charts';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages';
import { AdminComponent } from './pages';
import { UserComponent } from './pages';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    DashboardComponent,
    AdminComponent,
    UserComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgChartsModule,
    SharedModule,
    FormsModule
  ]
})
export class AdminModule { }
