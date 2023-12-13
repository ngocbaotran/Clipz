import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import videojs from 'video.js';

import IClip from '../../models/clip.model';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class QuickViewComponent implements OnInit {
  @Input() activeClip?: IClip;
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef;
  player?: videojs.Player;
  clip?: IClip;

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.clip = this.activeClip as IClip;
    this.player?.src({
      src: this.clip.url,
      type: 'video/mp4'
    });
  }

  closeModal() {
    this.player?.dispose();
    this.modalService.unregister('quickViewClip');
  }
}
