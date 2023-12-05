import { Component, OnInit, Renderer2 } from '@angular/core';

import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isSidebarVisible: boolean = true;

  constructor(
    public adminService: AdminService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'padding-bottom', '0');
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible
  }
}
