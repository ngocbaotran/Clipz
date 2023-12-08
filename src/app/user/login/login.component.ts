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
      const userCredential = await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
      const user = userCredential.user;

      if (user) {
        const userDoc = await this.db.collection('users').doc(user.uid).get().toPromise();
        const userData = userDoc.data() as IUser;

        if (!userData) {
          await this.authService.logout();
          this.inSubmission = false;
          this.alertMsg = 'Không có quyền truy cập vào tài khoản này.';
          this.alertColor = 'red';
        } else if (userData.status === 'inactive') {
          await this.authService.logout();
          this.inSubmission = false;
          this.alertMsg = 'Tài khoản không tồn tại.';
          this.alertColor = 'red';
        } else {
          this.alertMsg = 'Success! You are now logged in.';
          this.alertColor = 'green';
        }

        this.authService.isAuthenticatedWithDelay$ = this.authService.isAuthenticated$.pipe(delay(1000));
      }
    } catch (e) {
      this.inSubmission = false;
      this.alertMsg = 'An unexpected error occurred. Please try again later.';
      this.alertColor = 'red';
      return;
    }
  }
}
