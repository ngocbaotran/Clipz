import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { DatePipe } from '@angular/common';

import IClip from '../models/clip.model';
import { ClipService } from '../services/clip.service';
import { AppService } from '../app.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [DatePipe]
})
export class SearchComponent implements OnInit, OnDestroy {
  clips: IClip[] = [];
  searchString = '';
  copied = false;
  searchClipsSubscription?: Subscription;

  constructor(
    public clipService: ClipService,
    public appService: AppService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.searchString = params.searchString;
    });

    this.searchClipsSubscription = this.clipService.searchClips.subscribe(async () => {
      this.appService.overload();
      this.clips = [];
      this.clipService.pageClips = [];
      await this.clipService.getSearchClips();

      for (let clip of this.clipService.pageClips) {
        if (clip.displayName.toUpperCase().includes(this.searchString.toUpperCase())
          || clip.title.toUpperCase().includes(this.searchString.toUpperCase())) {
          this.clips.push(clip);
        }
      }

      this.appService.overload(false);
    });

    this.clipService.searchClips.next();
  }

  ngOnDestroy() {
    this.clips = [];
    this.clipService.pageClips = [];
    this.searchClipsSubscription?.unsubscribe();
  }

  copyToClipboard() {
    // code
  }
}
