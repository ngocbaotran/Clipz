import firebase from 'firebase/compat';

export default interface IUser {
  email: string,
  password?: string,
  age: number,
  name: string,
  phoneNumber: string
  created: firebase.firestore.FieldValue;
}
