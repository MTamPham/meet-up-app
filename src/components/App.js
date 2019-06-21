import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from './Navigation';
import LandingPage from './Landing';
import SignInPage from './SignIn';
import PasswordForgetPage from './PasswordForget';
import PasswordChangePage from './PasswordChange';
import HomePage from './Home';
import AccountPage from './Account';
import ViewPage from './View';

import * as ROUTERS from '../constants/routes';
import { withAuthentication } from '../session';

const App = () =>
    <Router>
        <React.Fragment>
            <Navigation />
            <Route
                exact path={ROUTERS.LANDING}
                component={HomePage}
            />
            <Route
                exact path={ROUTERS.SIGN_IN}
                component={SignInPage}
            />
            <Route
                exact path={ROUTERS.PASSWORD_FORGET}
                component={PasswordForgetPage}
            />
            <Route
                exact path={ROUTERS.PASSWORD_CHANGE}
                component={PasswordChangePage}
            />
            <Route
                exact path={ROUTERS.HOME}
                component={HomePage}
            />
            <Route
                exact path={ROUTERS.ACCOUNT}
                component={AccountPage}
            />
            <Route
                exact path={ROUTERS.ACCOUNT}
                component={AccountPage}
            />
            <Route
                path={ROUTERS.VIEW}
                component={ViewPage}
            />
        </React.Fragment>
    </Router>

export default withAuthentication(App);
