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
    private angularFireAuth: AngularFireAuth,
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

      window.scrollTo(0, 0);
    });
  }

  async toggleFavorite() {
    if (!this.clip?.docID || !this.user?.uid) {
      return;
    }

    if (!this.clip.favorites) {
      this.clip.favorites = [];
    }

    if (this.clip.favorites.indexOf(this.user.uid) < 0) {
      this.clip.favorites.push(this.user.uid);
    } else {
      this.clip.favorites = this.clip.favorites.filter(element => element !== this.user?.uid);
    }

    await this.clipService.updateFavorites(this.clip.docID, this.clip.favorites);
  }

  hasFavorite() {
    return this.clip && this.clip.favorites && this.user && this.clip.favorites.indexOf(this.user.uid) > -1;
  }

  shareVideo() {
    if (!this.clip?.url) {
      return;
    }

    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.clip.url)}`;
    window.open(shareUrl, '_blank');
  }


  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}
