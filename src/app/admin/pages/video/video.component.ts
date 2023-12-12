import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../../services/admin.service';
import IClip from '../../../models/clip.model';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
  providers: [DatePipe]
})
export class VideoComponent implements OnInit, OnDestroy {
  pageSize: number = 7;
  currentPage: number = 1;
  totalPages: number = 0;
  searchString: string = '';
  selectedClip: IClip | null = null;
  modalType: string = '';
  showAlert: boolean = false;
  clipHovered: IClip | null = null;

  hoverState: {
    isIconHovered: boolean
  } = {
    isIconHovered: false
  };

  constructor(
    public adminService: AdminService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.adminService.getClips();
    this.getTotalPages();
  }

  getTotalPages() {
    this.adminService.getTotalClips().subscribe((totalClips) => {
      this.totalPages = Math.ceil(totalClips / this.pageSize);
    });
  }

  async prevPage(): Promise<void> {
    if (this.currentPage > 1) {
      await this.adminService.getClips('previous');
      this.currentPage--;
    }
  }

  async nextPage(): Promise<void> {
    if (this.currentPage === this.totalPages) {
      return;
    }

    await this.adminService.getClips('next');
    this.currentPage++;
  }

  async search($event: Event): Promise<void> {
    $event.preventDefault();

    if (this.adminService.pendingReq) {
      return;
    }

    if (!this.searchString) {
      return;
    }

    await this.adminService.getUserByField({
      field: 'email',
      value: this.searchString
    });

    this.searchString = '';
  }

  async copyToClipboard($event: MouseEvent, uid: string | undefined) {
    $event.preventDefault();

    if (!uid) {
      return;
    }

    await navigator.clipboard.writeText(uid);
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 2000);
  }

  showClipDetail(clip: IClip) {
    this.selectedClip = clip;
  }

  closeClipDetail() {
    this.selectedClip = null;
  }

  ngOnDestroy() {
    this.adminService.pageClips = [];
    this.adminService.pageUsers = [];
  }
}
