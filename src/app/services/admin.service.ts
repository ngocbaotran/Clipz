import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { deleteUser } from "firebase/auth";

import IUser from '../models/user.model';
import IClip from '../models/clip.model';

@Injectable()
export class AdminService {
  usersCollection: AngularFirestoreCollection<IUser>;
  clipsCollection: AngularFirestoreCollection<IClip>;
  clipsPendingCollection: AngularFirestoreCollection<IClip>;
  clipsReportedCollection: AngularFirestoreCollection<IClip>;
  pageUsers: IUser[] = [];
  pageClips: IClip[] = [];
  pendingReq = false;
  private us: string = 'admin@test.com';
  private ps: string = 'Iknowmyname8994@';

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.usersCollection = firestore.collection('users');
    this.clipsCollection = firestore.collection('clips');
    this.clipsPendingCollection = firestore.collection('clipsPending');
    this.clipsReportedCollection = firestore.collection('clipsReported');
  }

  getTotalUsers(): Observable<number> {
    return this.firestore.collection('users')
      .get()
      .pipe(
        map((querySnapshot) => querySnapshot.size)
      );
  }

  getTotalClips(): Observable<number> {
    return this.clipsCollection.get().pipe(
      map((querySnapshot) => querySnapshot.size)
    );
  }

  getTotalClipsPending(): Observable<number> {
    return this.clipsPendingCollection
      .valueChanges()
      .pipe(
        map(docs => docs.length)
      );
  }

  getTotalClipsReported(): Observable<number> {
    return this.clipsReportedCollection
      .valueChanges()
      .pipe(
        map(docs => docs.length)
      );
  }

  getTotalUploadedThisMonth(): Observable<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.firestore
      .collection('clips', (ref) =>
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
  getClipCountsByMonth(month: number): Observable<number> {
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59);

    return this.firestore
      .collection('clips', ref =>
        ref
          .where('timestamp', '>=', startOfMonth)
          .where('timestamp', '<=', endOfMonth)
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
      this.pageUsers = [];
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

  async getUserByUid(uid: string): Promise<void> {
    this.pendingReq = true;
    const userRef = this.usersCollection.ref.doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      this.pageUsers = [];
      this.pendingReq = false;
      return;
    }

    const user: IUser = {
      docID: doc.id,
      ...doc.data() as IUser
    };

    this.pageUsers = [user];
    this.pendingReq = false;
  }

  async deleteUser(user: IUser) {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(
      user.email,
      this.ps
    );

    if (userCredential && userCredential.user) {
      await deleteUser(userCredential.user);
      await this.afAuth.signInWithEmailAndPassword(this.us, this.ps);
      await this.usersCollection.doc(user.docID).delete();
    }
  }

  blockUser(user: IUser): Promise<void> {
    return this.usersCollection.doc(user.docID).update({
      status: 'suspended'
    });
  }

  unlockUser(user: IUser): Promise<void> {
    return this.usersCollection.doc(user.docID).update({
      status: 'active'
    });
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.afAuth.signOut();
    await this.router.navigateByUrl('/admin/login');
  }

  async getClips(option?: string) {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsCollection.ref
      .orderBy('timestamp', 'asc')
      .limit(7);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection
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
    const clips: IClip[] = [];

    snapshot.forEach(doc => {
      clips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageClips = clips;
    this.pendingReq = false;
  }

  async getClipsPending(option?: string) {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsPendingCollection.ref
      .orderBy('timestamp', 'asc')
      .limit(7);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsPendingCollection
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
    const clips: IClip[] = [];

    snapshot.forEach(doc => {
      clips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageClips = clips;
    this.pendingReq = false;
  }

  async getClipsByField(info: { field: string, value: string }): Promise<void> {
    this.pendingReq = true;
    const query = this.clipsCollection.ref.where(info.field, '==', info.value);
    const snapshot = await query.get();

    if (snapshot.empty) {
      this.pageClips = [];
      this.pendingReq = false;
      return;
    }

    const clips: IClip[] = [];

    snapshot.forEach(doc => {
      clips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageClips = clips;
    this.pendingReq = false;
  }

  async getClipsById(cid: string): Promise<void> {
    this.pendingReq = true;
    const clipRef = this.clipsCollection.ref.doc(cid);
    const doc = await clipRef.get();

    if (!doc.exists) {
      this.pageClips = [];
      this.pendingReq = false;
      return;
    }

    const clip: IClip = {
      docID: doc.id,
      ...doc.data() as IClip
    };

    this.pageClips = [clip];
    this.pendingReq = false;
  }

  async getClipsReported(option?: string) {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsReportedCollection.ref
      .orderBy('timestamp', 'asc')
      .limit(7);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsReportedCollection
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
    const clips: IClip[] = [];

    snapshot.forEach(doc => {
      clips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pageClips = clips;
    this.pendingReq = false;
  }
}
