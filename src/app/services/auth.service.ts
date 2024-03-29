import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";

import { Observable, of} from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import firebase from 'firebase/compat/app';

import IUser from "../models/user.model";

@Injectable()
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean> | undefined;
  public isAuthenticatedWithDelay$: Observable<boolean> | undefined;
  public redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = db.collection('users');
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.route.firstChild),
      switchMap((route) => route?.data ?? of({authOnly: false}))
    ).subscribe((data) => {
      this.redirect = data.authOnly ?? false;
    });
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error("Password not provided!");
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password);

    if (!userCred.user) {
      throw new Error("User can't be found");
    }

    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      role: 'user'
    });

    await userCred.user.updateProfile({
      displayName: userData.name
    });
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }

  public async updateUser(userData: IUser, uid: string | undefined) {
    return this.usersCollection.doc(uid).update({
      name: userData.name,
      age: userData.age
    });
  }

  checkUserStatus() {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        return this.usersCollection.doc(user.uid)
          .valueChanges()
          .pipe(
            map(doc => doc?.status ?? '')
          );
      })
    );
  }
}
