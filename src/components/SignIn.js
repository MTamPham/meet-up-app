import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../firebase';
import { PasswordForgetLink } from './PasswordForget';
import * as ROUTES from '../constants/routes';

const SignInPage = () => (
  <div className="container">
    <input type="radio" name="tab" id="signin" defaultChecked="checked" />
    <input type="radio" name="tab" id="register" />
    <div className="pages">
      <div className="page">
        <SignInForm />
        <PasswordForgetLink />
        <SignInGoogle />
      </div>
      <div className="page signup">
        <SignUpForm />
      </div>
    </div>
    <div className="tabs">
      <label className="tab" htmlFor="signin"><div className="text">Sign In</div></label>
      <label className="tab" htmlFor="register"><div className="text">Sign Up</div></label>
    </div>
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  password: '',
  error: null,
};

const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an E-Mail address to
  this social account already exists. Try to login from
  this account instead and associate your social accounts on
  your personal account page.
`;

class SignInFormBase extends Component {
  constructor(props) {
      super(props);

      this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { email, password } = this.state;
    
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
        email,
        password,
        error,
    } = this.state;

    const isInvalid =
        password === '' ||
        email === '';

    return (
      <form onSubmit={this.onSubmit}>
        <div className="input">
          <div className="title"><i className="material-icons">markunread_mailbox</i> EMAIL</div>
          <input
            className="text"
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder=""
          />
        </div>
        <div className="input">
          <div className="title"><i className="material-icons">lock</i> PASSWORD</div>
          <input
            className="text"
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder=""
          />
        </div>
        <div className="input"><input disabled={isInvalid} type="submit" value="SIGN IN" /></div>

        {error && <p className="message">{error.message}</p>}
      </form>
    );
  }
}

class SignInGoogleBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase.user(socialAuthUser.user.uid).set({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
          roles: [],
        });
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button type="submit" className="google-button">
          <span className="google-button__icon">
            <svg viewBox="0 0 366 372" xmlns="http://www.w3.org/2000/svg"><path d="M125.9 10.2c40.2-13.9 85.3-13.6 125.3 1.1 22.2 8.2 42.5 21 59.9 37.1-5.8 6.3-12.1 12.2-18.1 18.3l-34.2 34.2c-11.3-10.8-25.1-19-40.1-23.6-17.6-5.3-36.6-6.1-54.6-2.2-21 4.5-40.5 15.5-55.6 30.9-12.2 12.3-21.4 27.5-27 43.9-20.3-15.8-40.6-31.5-61-47.3 21.5-43 60.1-76.9 105.4-92.4z" id="Shape" fill="#EA4335"/><path d="M20.6 102.4c20.3 15.8 40.6 31.5 61 47.3-8 23.3-8 49.2 0 72.4-20.3 15.8-40.6 31.6-60.9 47.3C1.9 232.7-3.8 189.6 4.4 149.2c3.3-16.2 8.7-32 16.2-46.8z" id="Shape" fill="#FBBC05"/><path d="M361.7 151.1c5.8 32.7 4.5 66.8-4.7 98.8-8.5 29.3-24.6 56.5-47.1 77.2l-59.1-45.9c19.5-13.1 33.3-34.3 37.2-57.5H186.6c.1-24.2.1-48.4.1-72.6h175z" id="Shape" fill="#4285F4"/><path d="M81.4 222.2c7.8 22.9 22.8 43.2 42.6 57.1 12.4 8.7 26.6 14.9 41.4 17.9 14.6 3 29.7 2.6 44.4.1 14.6-2.6 28.7-7.9 41-16.2l59.1 45.9c-21.3 19.7-48 33.1-76.2 39.6-31.2 7.1-64.2 7.3-95.2-1-24.6-6.5-47.7-18.2-67.6-34.1-20.9-16.6-38.3-38-50.4-62 20.3-15.7 40.6-31.5 60.9-47.3z" fill="#34A853"/></svg>
          </span>
          <span className="google-button__text">Sign in with Google</span>
        </button>

        {error && <p class="message">{error.message}</p>}
      </form>
    );
  }
}

class SignUpFormBase extends Component {
  constructor(props) {
      super(props);

      this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
      const {
          username,
          email,
          password,
      } = this.state;

      this.props.firebase
        .doCreateUserWithEmailAndPassword(email, password)
        .then(authUser => {
          // Create a user in your Firebase realtime database
          return this.props.firebase.user(authUser.user.uid).set({
            username,
            email,
          });
        })
        .then(() => {
          return this.props.firebase.doSendEmailVerification();
        })
        .then(() => {
          this.setState({ ...INITIAL_STATE });
          this.props.history.push(ROUTES.HOME);
        })
        .catch(error => {
          if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
            error.message = ERROR_MSG_ACCOUNT_EXISTS;
          }

          this.setState({ error });
        });

      event.preventDefault();
  }

  onChange = event => {
      this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
        username,
        email,
        password,
        rePassword,
        error,
    } = this.state;

    const isInvalid =
        password !== rePassword ||
        password === '' ||
        email === '' ||
        username === '';

    return (
      <React.Fragment>
        <form onSubmit={this.onSubmit}>
          <div className="input">
            <div className="title"><i className="material-icons">person</i> NAME</div>
            <input
              className="text"
              name="username"
              value={username}
              onChange={this.onChange}
              type="text"
              placeholder=""
            />
          </div>
          <div className="input">
            <div className="title"><i className="material-icons">markunread_mailbox</i> EMAIL</div>
            <input
              className="text"
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              placeholder=""
            />
          </div>
          <div className="input">
            <div className="title"><i className="material-icons">lock</i> PASSWORD</div>
            <input
              className="text"
              name="password"
              value={password}
              onChange={this.onChange}
              type="password"
              placeholder=""
            />
          </div>
          <div className="input">
            <div className="title"><i className="material-icons">lock</i> RE-PASSWORD</div>
            <input
              className="text"
              name="rePassword"
              value={rePassword}
              onChange={this.onChange}
              type="password"
              placeholder=""
            />
          </div>
          <div className="input"><input disabled={isInvalid} type="submit" value="SIGN UP" /></div>
          {error && <p class="message">{error.message}</p>}
        </form>
      </React.Fragment>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

const SignInGoogle = compose(
  withRouter,
  withFirebase,
)(SignInGoogleBase);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignInPage;

export {
    SignInForm,
    SignInGoogle,
    SignUpForm,
};