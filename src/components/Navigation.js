import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../session';
import * as ROUTES from '../constants/routes';
import SignOutButton from './SignOut';

const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
        null
      )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({authUser}) =>
  <div id="header">
    <div id="logo"><a href="/"><img src="/Frontend/logo.png" width="64px" /></a></div>
    
    <ul id="nav">
        <li><Link to={ROUTES.HOME}>HOME</Link></li>
        <li><Link to={ROUTES.PASSWORD_CHANGE}>CHANGE PASSWORD</Link></li>    
    </ul>

    <div id="account">
      <p>Welcome back, {authUser.username} !</p>
      <SignOutButton />  
    </div>
  </div>

const NavigationNonAuth = () =>
    <div className="sidebar">
        <Link to={ROUTES.SIGN_IN}>SIGN IN</Link>
    </div>

export default Navigation;