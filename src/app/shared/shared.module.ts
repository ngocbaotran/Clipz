import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { ModalComponent } from './modal/modal.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { TabComponent } from './tab/tab.component';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from "@angular/forms";
import { NgxMaskModule } from "ngx-mask";
import { AlertComponent } from './alert/alert.component';
import { EventBlockerDirective } from './directives/event-blocker.directive';
import { FbTimestampPipe } from '../pipes/fb-timestamp.pipe';
// import { ModalService } from '../services/modal.service';

@NgModule({
  declarations: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective,
    FbTimestampPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NzCommentModule,
    NzListModule,
    NzFormModule,
    NzAvatarModule,
    NzButtonModule,
    NzToolTipModule,
    NzIconModule,
  ],
  exports: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective,
    FbTimestampPipe,
    NzCommentModule,
    NzListModule,
    NzFormModule,
    NzAvatarModule,
    NzButtonModule,
    NzToolTipModule,
    NzIconModule,
    ReactiveFormsModule
  ],
  providers: [
    // ModalService
  ]
})
export class SharedModule { }
