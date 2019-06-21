import React from 'react';
import { Link } from 'react-router-dom';

import * as ROUTES from '../constants/routes';

const LandingPage = () =>
	<React.Fragment>
		<h1>Landing Page</h1>
		Are you ready to join with us?
		<Link to={ROUTES.SIGN_IN}>Yes</Link>
		<Link to={ROUTES.LANDING}>No</Link>
	</React.Fragment>

export default LandingPage;