import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import IUser from '../../../models/user.model';
import { AdminService } from '../../../services/admin.service';

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
  userSelected: IUser | null = null;
  isVisibleModal: boolean = false;
  modalType: string = '';

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

  ngOnDestroy() {
    this.adminService.pageClips = [];
    this.adminService.pageUsers = [];
  }
}
