import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskModule } from "ngx-mask";

import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { SharedModule } from "../shared/shared.module";
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [
    AuthModalComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent
  ],
  exports: [
    AuthModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    UserRoutingModule,
    NgxMaskModule.forRoot()
  ]
})
export class UserModule { }
