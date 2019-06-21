import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'

var config = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "xxxxxxxxxx.firebaseapp.com",
  databaseURL: "https://xxxxxxxxxx.firebaseio.com",
  projectId: "xxxxxxxxxx",
  storageBucket: "xxxxxxxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxxxxxxxxxx"
};

export default class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Firebase APIs */
    this.auth = app.auth();
    this.db = app.database();

    /* Social Sign In Method Provider */
    this.googleProvider = new app.auth.GoogleAuthProvider();
  }


  /********************************** Authentication Service **********************************/
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: "http://localhost:3000",
    });

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  onAuthUserListener = (next, callback) => {
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        callback();
      }
    });
  }


  /********************************** Users Service **********************************/
  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  /********************************** Timetable Service **********************************/  
  timetables = (uid) => this.db.ref('timetables').orderByChild('uid').equalTo(uid);

  timetable = (tid) => this.db.ref(`timetables/${tid}`);

  /********************************** Messages Service **********************************/
  // get messages which are sent to the current user
  messages = (uid) => this.db.ref('messages').orderByChild('to').equalTo(uid);

  message = (mid) => this.db.ref(`messages/${mid}`);
}