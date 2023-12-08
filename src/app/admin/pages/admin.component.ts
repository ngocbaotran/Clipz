import { Component, OnInit, Renderer2 } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import firebase from 'firebase/compat';

import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isSidebarVisible: boolean = true;
  user: firebase.User | null = null;
  avatar: string = '';

  constructor(
    public adminService: AdminService,
    private renderer: Renderer2,
    private angularFireAuth: AngularFireAuth
  ) {
    angularFireAuth.user.subscribe(user => {
      this.user = user
      this.avatar = !this.user || !this.user.email ? 'A' : this.user.email.substring(0, 1).toUpperCase();
    });
  }

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'padding-bottom', '0');
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible
  }
}
