import React, { Component } from 'react';

import { withFirebase } from '../firebase';

const INITIAL_STATE = {
  password: '',
  rePassword: '',
  error: null,
};

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { password } = this.state;

    this.props.firebase
      .doPasswordUpdate(password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
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
    const { password, rePassword, error } = this.state;

    const isInvalid =
      password !== rePassword || password === '';

    return (
      <div className="background">
        <form onSubmit={this.onSubmit}>
          <input
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder="New Password"
          />
          <input
            name="rePassword"
            value={rePassword}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm New Password"
          />
          <button disabled={isInvalid} type="submit">
            Reset My Password
          </button>

          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }
}

export default withFirebase(PasswordChangeForm);
