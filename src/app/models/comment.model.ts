import firebase from 'firebase/compat/app';

export interface IComment {
  docId: string;
  clipId: string;
  uid: string;
  displayName: string;
  timestamp: firebase.firestore.FieldValue;
  message: string;
  likes: number;
  likesByUser?: boolean;
  replies?: IReplies[];
  isReply?: boolean
}

export interface IReplies {
  uid: string;
  displayName: string;
  timestamp: firebase.firestore.FieldValue;
  message: string;
}
