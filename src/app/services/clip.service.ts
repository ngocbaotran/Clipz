import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";

import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import firebase from 'firebase/compat/app';

import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;
  searchClips: Subject<any> = new Subject()

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        );
        return query.get();
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>))
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    await clipRef.delete();
    await screenshotRef.delete();
    await this.clipsCollection.doc(clip.docID).delete();
  }

  async getClips() {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsCollection.ref
      .orderBy('timestamp', 'desc')
      .limit(6);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pendingReq = false;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params.id)
      .get()
      .pipe(
        map(snapshot => {
          const data = snapshot.data();

          if (!data) {
            this.router.navigate(['/']);
            return null;
          }

          return {
            docID: route.params.id,
            ...data
          };
        })
      );
  }

  updateFavorites(id: string, favorites: string[]) {
    return this.clipsCollection.doc(id).update({
      favorites
    });
  }

  // removeFavorite(id: string) {
  //   return this.clipsCollection.doc(id).update({
  //     favorite: firebase.firestore.FieldValue.delete()
  //   });
  // }

  getFavoriteClips() {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref.where('favorites', 'array-contains', user.uid);
        return query.get();
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>))
    );
  }

  async getSearchClips() {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;
    let query = this.clipsCollection.ref
      .orderBy('timestamp', 'desc');
    const snapshot = await query.get();

    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pendingReq = false;
  }
}
