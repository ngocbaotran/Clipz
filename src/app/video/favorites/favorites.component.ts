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
  docIDCopied = '';

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

  async copyToClipboard($event: MouseEvent, docID: string | undefined) {
    $event.preventDefault();

    if (!docID) {
      return;
    }

    const url = `${location.origin}/clip/${docID}`;
    await navigator.clipboard.writeText(url);
    this.docIDCopied = docID;

    setTimeout(() => {
      this.docIDCopied = '';
    }, 2500);
  }
}
