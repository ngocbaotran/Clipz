import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../../services/admin.service';
import IUser from '../../../models/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [DatePipe]
})
export class UserComponent implements OnInit, OnDestroy {
  pageSize: number = 7;
  currentPage: number = 1;
  totalPages: number = 0;
  searchString: string = '';
  userSelected: IUser | null = null;
  isVisibleModal: boolean = false;
  modalType: string = '';
  showAlert: boolean = false;

  hoverState: {
    userHovered: IUser | null
    isIconHovered: boolean
  } = {
    isIconHovered: false,
    userHovered: null
  };

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

    if (this.searchString.includes('@')) {
      await this.adminService.getUserByField({
        field: 'email',
        value: this.searchString
      });
    } else {
      await this.adminService.getUserByUid(this.searchString);
    }

    this.searchString = '';
  }

  onAction(modalType: string, userInfo: IUser) {
    this.modalType = modalType;
    this.userSelected = userInfo;
    this.isVisibleModal = true;
  }

  cancelModal() {
    this.modalType = '';
    this.userSelected = null;
    this.isVisibleModal = false;
  }

  async confirmModal($event: Event) {
    $event.preventDefault();

    if (!this.userSelected) {
      this.modalType = '';
      this.isVisibleModal = false;
      return;
    }

    switch(this.modalType) {
      case 'delete':
        await this.adminService.deleteUser(this.userSelected);
        this.adminService.pageUsers.forEach((element, index) => {
          if (element.docID == this.userSelected?.docID) {
            this.adminService.pageUsers.splice(index, 1);
          }
        });
        break;
      case 'block':
        await this.adminService.blockUser(this.userSelected);
        this.adminService.pageUsers.forEach((element) => {
          if (element.docID == this.userSelected?.docID) {
            element.status = 'suspended'
          }
        });
        break;
      case 'edit':
        await this.adminService.unlockUser(this.userSelected);
        this.adminService.pageUsers.forEach((element) => {
          if (element.docID == this.userSelected?.docID) {
            element.status = 'active'
          }
        });
        break;
      default:
        // code block
    }

    this.modalType = '';
    this.userSelected = null;
    this.isVisibleModal = false;
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

  ngOnDestroy() {
    this.adminService.pageUsers = [];
  }
}
