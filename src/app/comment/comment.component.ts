import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import firebase from 'firebase/compat/app';

import { CommentService } from '../services/comment.service';
import { IComment, IReplies } from '../models/comment.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy {
  inSubmission = false;
  message = new FormControl('');
  replyMessage = new FormControl('');
  commentForm = new FormGroup({
    message: this.message,
  });
  replyForm = new FormGroup({
    replyMessage: this.replyMessage,
  });
  user: firebase.User | null = null;
  comments: IComment[] = [];
  totalComments: number = 0;
  userSubscription?: Subscription;
  private _clipId: string = '';

  @Input()
  set clipId(id: string) {
    this._clipId = id;
    this.getCommentsData();
  }

  get clipId(): string {
    return this._clipId;
  }

  constructor(
    private commentService: CommentService,
    private auth: AngularFireAuth,
  ) {
    this.userSubscription = auth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void {
    this.getCommentsData();
  }

  private getCommentsData() {
    this.commentService.getCommentsByClipId(this.clipId, this.comments.length).subscribe(comments => {
      this.totalComments = 0;
      this.comments = [];

      comments.forEach(comment => {
        const commentCopy = { ...comment };
        this.commentService.getRepliesForComment(comment.docId).subscribe(replies => this.resolveRepliesForComment(commentCopy, replies));
      });
    });
  }

  async send(): Promise<void> {
    this.inSubmission = true;
    const comment = {
      clipId: this.clipId,
      uid: this.user?.uid as string,
      displayName: this.user?.displayName as string,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: this.commentForm.value.message,
      likes: 0
    };

    try {
      await this.commentService.addComment(comment as IComment);
    } catch (e) {
      console.error(e);
    } finally {
      this.commentForm.reset();
      this.inSubmission = false;
    }
  }

  toggleReply(comment: IComment): void {
    comment.isReply = !comment.isReply;

    if (comment.isReply) {
      setTimeout(() => {
        const replyBoxElement = document.getElementById(comment.docId);

        if (replyBoxElement) {
          replyBoxElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }
      });
    }
  }

  async reply(comment: IComment): Promise<void> {
    this.inSubmission = true;
    const replyData = {
      uid: this.user?.uid as string,
      displayName: this.user?.displayName as string,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: this.replyForm.value.replyMessage
    };

    try {
      await this.commentService.addReply(comment.docId, replyData);
    } catch (e) {
      console.error(e);
    } finally {
      this.replyForm.reset();
      this.inSubmission = false;
    }
  }

  trackByCommentId(index: number, comment: IComment): string {
    return comment.docId;
  }

  async likeComment(comment: IComment): Promise<void> {
    if (comment.likesByUser) {
      comment.likes -= 1;
      comment.likesByUser = false;
    } else {
      comment.likes += 1;
      comment.likesByUser = true;
    }

    await this.commentService.updateCommentLikes(comment.docId, comment.likes);
    await this.commentService.updateUserLikeStatus(comment.docId, comment.likesByUser);
  }

  async loadMoreComments(): Promise<void> {
    const { length } = this.comments;

    if (length) {
      const lastCommentDocId = this.comments[length - 1].docId;
      const additionalComments = await this.commentService.getAdditionalComments(this.clipId, lastCommentDocId);

      additionalComments.forEach(comment => {
        this.commentService.getRepliesForComment(comment.docId).subscribe(replies => this.resolveRepliesForComment(comment, replies));
      });
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  private resolveRepliesForComment(comment: IComment, replies: IReplies[]) {
    const cmt = this.comments.find(cmt => cmt.docId === comment.docId);

    if (cmt) {
      this.totalComments -= cmt.replies ? cmt.replies.length : 0;
      cmt.replies = replies;
      this.totalComments += replies.length;
    } else {
      comment.replies = replies;
      this.comments.push(comment);
      this.totalComments += 1 + replies.length;
    }
  }
}
