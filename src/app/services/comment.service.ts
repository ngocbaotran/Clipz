import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IComment, IReplies } from '../models/comment.model';


@Injectable({
  providedIn: 'root'
})
export class CommentService {
  public commentsCollection: AngularFirestoreCollection<IComment>;

  constructor(
    private db: AngularFirestore
  ) {
    this.commentsCollection = db.collection('comments');
  }

  addComment(data: IComment): Promise<DocumentReference<IComment>> {
    return this.commentsCollection.add(data);
  }

  getCommentsByClipId(clipId: string, limit: number = 5): Observable<IComment[]> {
    return this.db.collection(
      'comments',
      ref => ref
        .where('clipId', '==', clipId)
        .orderBy('timestamp', 'desc')
        .limit(limit <= 5 ? 5 : limit)
    ).snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as IComment;
          data['docId'] = a.payload.doc.id;
          return data;
        }))
      );
  }

  async addReply(commentId: string, data: IReplies): Promise<void> {
    const commentRef = this.commentsCollection.doc(commentId);
    await commentRef.collection('replies').add(data);
  }

  getRepliesForComment(commentId: string): Observable<IReplies[]> {
    return this.db.collection(`comments/${commentId}/replies`, ref => ref.orderBy('timestamp', 'asc'))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          return a.payload.doc.data() as IReplies;
        }))
      );
  }

  updateCommentLikes(commentId: string, likes: number): Promise<void> {
    return this.commentsCollection.doc(commentId).update({likes});
  }

  updateUserLikeStatus(commentId: string, liked: boolean): Promise<void> {
    return this.commentsCollection.doc(commentId).update({likesByUser: liked});
  }

  async getAdditionalComments(clipId: string, lastCommentDocId: string): Promise<IComment[]> {
    let query = this.commentsCollection.ref
      .where('clipId', '==', clipId)
      .orderBy('timestamp', 'desc')
      .limit(5);

    if (lastCommentDocId) {
      const lastDoc = await this.commentsCollection
        .doc(lastCommentDocId)
        .get()
        .toPromise();

      query = query.startAfter(lastDoc);
    }

    const querySnapshot = await query.get();
    const additionalComments: IComment[] = [];

    querySnapshot.docs.forEach(doc => {
      additionalComments.push({
        ...doc.data() as IComment,
        docId: doc.id,
      });
    });

    return additionalComments;
  }

  getTotalComments(clipId: string): Observable<number> {
    return this.db.collection('comments', ref => ref
      .where('clipId', '==', clipId)
    ).valueChanges()
      .pipe(
        map(docs => docs.length)
      );
  }
}
