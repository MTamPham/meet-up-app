import React from 'react';

import { withFirebase } from '../firebase';

const SignOutButton = ({ firebase }) => (
	<a href="#" onClick={firebase.doSignOut}>SIGN OUT</a>
);

export default withFirebase(SignOutButton);
