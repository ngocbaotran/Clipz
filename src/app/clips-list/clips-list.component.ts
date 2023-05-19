import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ClipService } from "../services/clip.service";

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {

  constructor(
    public clipService: ClipService
  ) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    // Lắng nghe sự kiện scroll từ window
    window.addEventListener('scroll', this.handleScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  }
}
