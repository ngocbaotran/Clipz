import firebase from 'firebase/compat';

export default interface IUser {
  docID?: string;
  email: string;
  password?: string;
  age: number;
  name: string,
  phoneNumber: string;
  created: firebase.firestore.FieldValue;
  status: string;
  role: string;
}
