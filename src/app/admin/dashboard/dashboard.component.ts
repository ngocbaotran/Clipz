import { Component, OnInit, Renderer2 } from '@angular/core';

import Chart from 'chart.js/auto';
import { combineLatest } from 'rxjs';

import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalClips: number = 0;
  totalUploadedThisMonth: number = 0;
  userCounts: string[] = [];
  chart: any;

  constructor(
    private adminService: AdminService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'padding-bottom', '0');
    this.adminService.getTotalUsers().subscribe((totalUsers) => {
      this.totalUsers = totalUsers;
    });

    this.adminService.getTotalClips().subscribe((totalClips) => {
      this.totalClips = totalClips;
    });

    this.adminService.getTotalUploadedThisMonth().subscribe((totalUploadedThisMonth) => {
      this.totalUploadedThisMonth = totalUploadedThisMonth;
    });

    this.getUserCountsByCurrentYear();
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line',

      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          {
            label: '',
            data: this.userCounts,
            // data: ['500', '50', '60', '79', '100', '350', '700', '150', '850', '375', '125', '85'],
          }
        ]
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  getUserCountsByCurrentYear() {
    const currentMonth = new Date().getMonth() + 1;
    const observables = [];

    for (let month = 1; month <= currentMonth; month++) {
      observables.push(this.adminService.getUserCountsByMonth(month));
    }

    combineLatest(observables).subscribe(counts => {
      this.userCounts = counts.map(count => count.toString());
      this.createChart();
    });
  }
}
