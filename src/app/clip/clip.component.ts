import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from "@angular/common";
import { AngularFireAuth } from '@angular/fire/compat/auth';

import videojs from 'video.js';
import { Subscription } from 'rxjs';

import IClip from "../models/clip.model";
import { ClipService } from '../services/clip.service';
import firebase from 'firebase/compat';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ClipComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef;
  player?: videojs.Player;
  clip?: IClip;
  userSubscription?: Subscription;
  user: firebase.User | null = null;

  constructor(
    public route: ActivatedRoute,
    private clipService: ClipService,
    private angularFireAuth: AngularFireAuth
  ) {
    this.userSubscription = angularFireAuth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.route.data.subscribe(data => {
      this.clip = data.clip as IClip;
      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4'
      });
    });
  }

  async toggleFavorite() {
    if (!this.clip?.docID || !this.user?.uid) {
      return;
    }

    if (!this.clip.favorite) {
      await this.clipService.addFavorite(this.clip.docID, this.user.uid);
      this.clip.favorite = this.user.uid;
    } else {
      await this.clipService.removeFavorite(this.clip.docID);
      delete this.clip.favorite;
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}
