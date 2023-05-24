import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';

import firebase from 'firebase/compat/app';

import { ModalService } from '../services/modal.service';
import { AuthService } from "../services/auth.service";
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  user: firebase.User | null = null;
  searchString = '';

  constructor(
    public modalService: ModalService,
    public auth: AuthService,
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService
  ) {
    angularFireAuth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void {
  }

  openModal($event: Event) {
    $event.preventDefault();
    this.modalService.toggleModal('auth');
  }

  async search() {
    if (!this.searchString) {
      return;
    }

    await this.router.navigate(['/search'], {
      relativeTo: this.route,
      queryParams: {
        searchString: this.searchString
      }
    });
    this.clipService.searchClips.next();
    this.searchString = '';
  }
}
