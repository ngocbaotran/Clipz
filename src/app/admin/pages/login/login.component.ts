import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import IUser from '../../../models/user.model';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  showAlert = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
  }

  async login() {
    if (!this.email || !this.password) {
      return
    }

    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      const user = userCredential.user;

      if (user) {
        const userDoc = await this.firestore.collection('admins').doc(user.uid).get().toPromise();
        const userData = userDoc.data() as IUser;

        if (!userData) {
          await this.adminService.logout();
          this.showAlert = true;
        }

        await this.router.navigateByUrl('/admin');
      } else {
        this.showAlert = true;
      }
    } catch (error) {
      this.showAlert = true;
    } finally {
      this.email = '';
      this.password = '';
    }
  }
}
