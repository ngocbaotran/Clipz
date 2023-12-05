import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../../services/admin.service';
import IUser from '../../../models/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [DatePipe]
})
export class UserComponent implements OnInit {
  pageSize: number = 7;
  currentPage: number = 1;
  totalPages: number = 0;
  searchString: string = '';
  userSelected: IUser | null = null;
  isVisibleModal: boolean = false;

  constructor(
    public adminService: AdminService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.adminService.getUsers();
    this.getTotalPages();
  }

  getTotalPages() {
    this.adminService.getTotalUsers().subscribe((totalUsers) => {
      this.totalPages = Math.ceil(totalUsers / this.pageSize);
    });
  }

  async prevPage(): Promise<void> {
    if (this.currentPage > 1) {
      await this.adminService.getUsers('previous');
      this.currentPage--;
    }
  }

  async nextPage(): Promise<void> {
    if (this.currentPage === this.totalPages) {
      return;
    }

    await this.adminService.getUsers('next');
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

  deleteAction(userInfo: IUser) {
    this.userSelected = userInfo;
    this.isVisibleModal = true;
  }

  async confirmModal($event: Event) {
    $event.preventDefault();

    if (!this.userSelected) {
      this.isVisibleModal = false;
      return;
    }

    await this.adminService.deleteUser(this.userSelected);
    this.adminService.pageUsers.forEach((element, index) => {
      if (element.docID == this.userSelected?.docID) {
        this.adminService.pageUsers.splice(index, 1);
      }
    });

    this.isVisibleModal = false;
  }
}
