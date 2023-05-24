import { Component, OnInit } from '@angular/core';
import { DatePipe } from "@angular/common";

import IClip from '../../models/clip.model';
import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  providers: [DatePipe]
})
export class FavoritesComponent implements OnInit {
  clips: IClip[] = [];
  copied = false;

  constructor(
    private clipService: ClipService
  ) { }

  ngOnInit(): void {
    this.clipService.getFavoriteClips().subscribe(docs => {
      this.clips = [];

      docs.forEach(doc => {
        this.clips.push({
          docID: doc.id,
          ...doc.data() as IClip
        });
      });
    });
  }

  copyToClipboard() {
    // code
  }
}
