import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgChartsModule } from 'ng2-charts';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent, VideoComponent } from './pages';
import { AdminComponent } from './pages';
import { UserComponent } from './pages';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './pages';
import { AdminService } from '../services/admin.service';



@NgModule({
  declarations: [
    DashboardComponent,
    AdminComponent,
    UserComponent,
    LoginComponent,
    VideoComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgChartsModule,
    SharedModule,
    FormsModule
  ],
  providers: [AdminService]
})
export class AdminModule { }
