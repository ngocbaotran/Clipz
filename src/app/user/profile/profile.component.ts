import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router"

import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import IUser from '../../models/user.model';
import { RegisterValidators } from "../validators/register-validators";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  user: firebase.User | null = null;
  changePassword = false;
  img3D = false;
  userData: IUser | null = null
  inSubmission = false;
  showAlert = false;
  alertMsg = '';
  alertColor = 'blue';
  userSubscription?: Subscription;

  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  email = new FormControl({ value: '', disabled: true });
  age = new FormControl('', [Validators.required]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]);
  confirm_password = new FormControl('', [
    Validators.required
  ]);
  phoneNumber = new FormControl({ value: '', disabled: true });

  informationForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    phoneNumber: this.phoneNumber,
    password: this.password,
    confirm_password: this.confirm_password,
  }, [RegisterValidators.match('password', 'confirm_password')]);

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {
    // code
  }

  async ngOnInit() {
    this.userSubscription = this.auth.user.subscribe(user => {
      if (user) {
        this.user = user;
        this.firestore
          .doc(`users/${user.uid}`)
          .valueChanges()
          .pipe(
            switchMap(val => {
              console.log(val);
              return of(val as IUser)
            })
          )
          .subscribe((userData: IUser) => {
            if (userData) {
              this.userData = userData;
              this.initFormValue();
            }
          });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.img3D = true;
    }, 700);
  }

  toggleChangePassword() {
    this.password.reset();
    this.confirm_password.reset();
    this.changePassword = !this.changePassword;
  }

  async updateUser() {
    this.informationForm.disable();
    this.showAlert = true;
    this.alertMsg = 'Vui lòng chờ! Tài khoản của bạn đang được cập nhật';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.authService.updateUser(this.informationForm.value, this.user?.uid);

      if (this.informationForm.value.password && this.informationForm.value.confirm_password) {
        await this.user?.updatePassword(this.password.value);
        await this.authService.logout();
        await this.router.navigateByUrl('/');
      }
    } catch (e) {
      this.alertMsg = 'Cập nhật thất bại! Vui lòng thử lại';
      this.alertColor = 'red';
      this.inSubmission = false;
      this.informationForm .enable();
      this.email.disable();
      this.phoneNumber.disable();
      return;
    }

    this.alertMsg = 'Thành công! Thông tin tài khoản đã được cập nhật';
    this.alertColor = 'green';

    setTimeout(() => {
      this.showAlert = false;
      this.inSubmission = false;
      this.informationForm.enable();
      this.email.disable();
      this.phoneNumber.disable();
    }, 1000);
  }

  ngOnDestroy() {
    this.informationForm.reset();
    this.userSubscription?.unsubscribe();
  }

  private initFormValue() {
    this.name.setValue(this.userData?.name);
    this.email.setValue(this.userData?.email);
    this.age.setValue(this.userData?.age);
    this.phoneNumber.setValue(this.userData?.phoneNumber);
  }
}
