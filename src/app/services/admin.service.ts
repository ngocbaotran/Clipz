import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  usersCollection: AngularFirestoreCollection<IUser>;
  pageUsers: IUser[] = [];
  pendingReq = false;

  constructor(
    private firestore: AngularFirestore
  ) {
    this.usersCollection = firestore.collection('users');
  }

  getTotalUsers(): Observable<number> {
    return this.firestore.collection('users')
      .get()
      .pipe(
        map((querySnapshot) => querySnapshot.size)
      );
  }

  getTotalClips(): Observable<number> {
    return this.firestore.collection('clips').get().pipe(
      map((querySnapshot) => querySnapshot.size)
    );
  }

  getTotalUploadedThisMonth(): Observable<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.firestore
      .collection('videos', (ref) =>
        ref
          .where('timestamp', '>=', firstDayOfMonth)
          .where('timestamp', '<=', lastDayOfMonth)
      )
      .get()
      .pipe(map((querySnapshot) => querySnapshot.size));
  }

  getUserCountsByMonth(month: number): Observable<number> {
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59);

    return this.firestore
      .collection('users', ref =>
        ref
          .where('created', '>=', startOfMonth)
          .where('created', '<=', endOfMonth)
      )
      .get()
      .pipe(map(querySnapshot => querySnapshot.size));
  }

  async getUsers(option?: string) {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.usersCollection.ref
      .orderBy('created', 'asc')
      .limit(7);

    const { length } = this.pageUsers;

    if (length) {
      const lastDocID = this.pageUsers[length - 1].docID;
      const lastDoc = await this.usersCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      if (option) {
        if (option === 'next') {
          query = query.startAfter(lastDoc);
        } else {
          query = query.endBefore(lastDoc);
        }
      }
    }

    const snapshot = await query.get();
    const users: IUser[] = [];

    snapshot.forEach(doc => {
      users.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageUsers = users;
    this.pendingReq = false;
  }

  async getUserByField(info: { field: string, value: string }): Promise<void> {
    this.pendingReq = true;
    const query = this.usersCollection.ref.where(info.field, '==', info.value);
    const snapshot = await query.get();

    if (snapshot.empty) {
      this.pendingReq = false;
      return;
    }

    const users: IUser[] = [];

    snapshot.forEach(doc => {
      users.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageUsers = users;
    this.pendingReq = false;
  }

  deleteUser(user: IUser): Promise<void> {
    return this.usersCollection.doc(user.docID).update({
      status: user.status
    });
  }
}
