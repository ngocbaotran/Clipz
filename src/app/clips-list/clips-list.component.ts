import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ClipService } from "../services/clip.service";
import { CommentService } from '../services/comment.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable = true;

  constructor(
    public clipService: ClipService,
    private commentService: CommentService
  ) {
    this.clipService.getClips();
    this.mapCommentToPageClips();
  }

  ngOnInit(): void {
    if (this.scrollable) {
      // Lắng nghe sự kiện scroll từ window
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  ngOnDestroy() {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipService.pageClips = [];
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
      this.mapCommentToPageClips();
    }
  }

  mapCommentToPageClips() {
    for (let clip of this.clipService.pageClips) {
      if (!clip.docID) {
        continue;
      }

      this.commentService.getTotalComments(clip.docID).subscribe(total => clip.totalComments = total);
    }
  }
}
