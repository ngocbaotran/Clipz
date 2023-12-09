import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { AngularFireAuth } from "@angular/fire/compat/auth";
import IUser from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  showAlert = false;
  alertMsg =  'Please wait! We are logging you in.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are logging you in.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
      this.authService.isAuthenticatedWithDelay$ = this.authService.isAuthenticated$.pipe(delay(1000));
    } catch (e) {
      this.inSubmission = false;
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColor = 'red';
      return;
    }

    this.alertMsg = 'Success! You are now logged in.';
    this.alertColor = 'green';
  }
}
