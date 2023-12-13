import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../../services/admin.service';
import IClip from '../../../models/clip.model';
import { ClipService } from '../../../services/clip.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
  providers: [DatePipe]
})
export class VideoComponent implements OnInit, OnDestroy {
  pageSize: number = 7;
  currentPage: number = 1;
  totalClipsPending: number = 0;
  totalClipsReported: number = 0;
  totalPages: number = 0;
  searchString: string = '';
  selectedClip: IClip | null = null;
  showAlert: boolean = false;
  searchType: string = 'cid';

  hoverState: {
    clipHovered: IClip | null
    isIconHovered: boolean
  } = {
    isIconHovered: false,
    clipHovered: null
  };

  constructor(
    public adminService: AdminService,
    private clipService: ClipService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.adminService.getClips();
    this.getTotalClipsPending();
    this.getTotalClipsReported();
    this.getTotalPages();
  }

  getTotalClipsPending() {
    this.adminService.getTotalClipsPending().subscribe((totalClips) => {
      this.totalClipsPending = totalClips;
    });
  }

  getTotalClipsReported() {
    this.adminService.getTotalClipsReported().subscribe((totalClips) => {
      this.totalClipsReported = totalClips;
    });
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

    if (this.searchType === 'uid') {
      await this.adminService.getClipsByField({
        field: 'uid',
        value: this.searchString
      });
    } else {
      await this.adminService.getClipsById(this.searchString);
    }

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

  async showClipsPending() {
    await this.adminService.getClipsPending();
  }

  async showClipsReported() {
    await this.adminService.getClipsReported();
  }

  async updateSearchType(event: Event) {
    const { value } = (event.target as HTMLSelectElement);
    this.searchType = value;
  }

  async rejectClip(clip: IClip) {
    await this.clipService.deleteClip(clip, true);
    this.closeClipDetail();
    this.adminService.pageClips.forEach((element, index) => {
      if (element.docID == clip.docID) {
        this.adminService.pageClips.splice(index, 1);
      }
    });
  }

  async approveClip(clip: IClip) {
    await this.adminService.clipsPendingCollection.doc(clip.docID).delete();
    await this.adminService.clipsCollection.doc(clip.docID).update({ status: 'approved' });
    this.closeClipDetail();
  }

  ngOnDestroy() {
    this.adminService.pageClips = [];
    this.adminService.pageUsers = [];
  }
}
