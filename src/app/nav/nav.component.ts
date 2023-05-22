import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ModalService } from '../services/modal.service';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  user: firebase.User | null = null;

  constructor(
    public modalService: ModalService,
    public auth: AuthService,
    private angularFireAuth: AngularFireAuth
  ) {
    angularFireAuth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void {
  }

  openModal($event: Event) {
    $event.preventDefault();
    this.modalService.toggleModal('auth');
  }
}
