import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter, useHistory } from 'react-router-dom';
import { setUser, resetUser } from '../../../../utils/redux/actions';
// import { Reset_DATA } from '../../../../utils/redux/actions/commonActions';
import styles from './index.module.css';
import ApiService from '../../../../utils/middleware/ApiService';
import ActivityLoader from '../../../atom/ActivityLoader/ActivityLoader';
import LOGO from '../../../../assets/imgs/LOGO.jpeg';
const Login = (props) => {
  let history = useHistory();

  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for error messages
  const [errorMessages, setErrorMessages] = useState({});
  const [showLoader, setShowLoader] = useState(false);

  // Validation state
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    resetUser();
  });

  const validate = () => {
    const errors = {};

    // Validate email field
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    // Validate password field
    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = (event) => {
    // Prevent page reload
    event.preventDefault();

    // Perform validation before submitting
    if (!validate()) return;

    setShowLoader(true);
    let payload = {
      username: email,
      password: password,
    };

    ApiService.post('/v1/login', payload, null, (res, err) => {
      if (res !== null) {
        props.setUser({
          userInfo: res,
        });
        setShowLoader(false);
        if (res.loggedUser.isActive !== true) {
          setErrorMessages({
            message: 'You do not have permission. Please contact the administrator.',
          });
          history.push('/');
        } else {
          history.push('/dashboard');
        }
      } else {
        setErrorMessages({ message: err.message });
        setShowLoader(false);
      }
    });
  };

  // Generate JSX code for validation errors
  const renderError = (field) => formErrors[field] && <span className={styles.error}>{formErrors[field]}</span>;

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}

      <div className={styles.app}>
        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            {/* <h1>SIZ</h1> */}
            <img src={LOGO} alt="logo" className={styles.logoStyle} />

            <h2>Log In</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>
                  Email address <span>*</span>
                </label>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {renderError('email')}
              </div>

              <div className={styles.inputGroup}>
                <label>
                  Password <span>*</span>
                </label>
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {renderError('password')}
                <label className={styles.error}>{errorMessages.message}</label>
              </div>

              <button type="submit" className={styles.loginButton}>
                Log In
              </button>
            </form>
            <div className={styles.loginFooter}>
              {/* <a href="/#" style={{display :'none'}}>Create an account</a> */}
              <a href="/forgetPassword">Forgot Password</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect((state) => ({ user: state.user }), {
  setUser,
  resetUser,
})(withRouter(Login));
