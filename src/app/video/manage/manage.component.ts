import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClipService } from '../../services/clip.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  videoOrder = '1';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {
    this.clipService.getUserClips().subscribe(console.log);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
    });
  }

  async sort(event: Event) {
    const { value } = (event.target as HTMLSelectElement);
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    });
  }
}
