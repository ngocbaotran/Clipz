import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private firestore: AngularFirestore
  ) { }

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
}
