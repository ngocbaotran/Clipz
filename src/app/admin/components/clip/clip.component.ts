import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';

import videojs from 'video.js';

import IClip from '../../../models/clip.model';
import { AdminService } from '../../../services/admin.service';
import IUser from '../../../models/user.model';

@Component({
  selector: 'admin-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef;
  @Input() selectedClip?: IClip;
  @Output() clipClosedEvent = new EventEmitter<string>();
  @Output() clipRejectedEvent = new EventEmitter<IClip>();
  @Output() clipApprovalEvent = new EventEmitter<IClip>();
  @Output() clipSkipEvent = new EventEmitter<IClip>();
  player?: videojs.Player;
  clip?: IClip;
  userClip?: IUser;

  constructor(
    public adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.clip = this.selectedClip as IClip;
    this.player?.src({
      src: this.clip.url,
      type: 'video/mp4'
    });
    this.getUserByUid();
  }

  closeClipDetail(): void {
    this.clipClosedEvent.emit();
  }

  getUserByUid() {
    this.adminService.usersCollection.doc(this.clip?.uid)
      .get()
      .subscribe(snapshot => {
        const data = snapshot.data();

        if (data) {
          this.userClip = {
            docID: this.clip?.uid,
            ...data
          }
        }
      });
  }

  rejectClip(): void {
    this.clipRejectedEvent.emit(this.selectedClip);
  }

  approveClip(): void {
    this.clipApprovalEvent.emit(this.selectedClip);
  }

  skipClip() {
    this.clipSkipEvent.emit(this.selectedClip);
  }
}
