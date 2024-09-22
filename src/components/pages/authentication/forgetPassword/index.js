import React, { useState } from 'react';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setUser, resetUser } from '../../../../utils/redux/actions';
import ApiService from '../../../../utils/middleware/ApiService';
import ActivityLoader from '../../../atom/ActivityLoader/ActivityLoader';

import styles from './forgotPassword.module.css';

const ForgetPassword = (props) => {
  const [errorMessages, setErrorMessages] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [showSucessMsg, setShowSucessMsg] = useState(false);

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();
    setShowLoader(true);
    var { email } = document.forms[0];
    let payload = {
      email: email.value,
      host: window.location.host,
    };
    ApiService.post('/v1/forgotPassword', payload, null, (res, err) => {
      if (err === null) {
        setShowSucessMsg({ message: res.message });
        setErrorMessages({ message: '' });
        setShowLoader(false);
        // history.push("/dashboard");
      } else {
        console.log(err);
        setShowSucessMsg({ message: '' });
        setErrorMessages({ message: err.message });
        setShowLoader(false);
      }
    });
  };

  // Generate JSX code for error message
  const renderErrorMessage = () => <label className={[styles.error, 'mb-2 mt-0'].join(' ')}>{errorMessages.message}</label>;

  // Generate JSX code for sucess message
  const renderSuccessMessage = () => <label className={[styles.success, 'mb-2 mt-0'].join(' ')}>{showSucessMsg.message}</label>;

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      <div className={styles.app}>
        <div className={styles.container}>
        
          <div className={styles.formContainer}>
          <h1 className={[styles.logo,"text-center"].join(" ")}>SIZ</h1>
            <h2 className="text-center">Password reset request</h2>
            <form onSubmit={handleSubmit} >
              <label htmlFor="email" className={[styles.inputGroupLabel,"mt-2"].join(" ")}>
                Email address <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputGroup}>
                <input type="email" id="email" name="email" placeholder="Enter your email" required />
                {/* <span className={styles.icon}>...</span> */}
              </div>
              {errorMessages?.message !== '' && <div className={styles.inputContainer}> {renderErrorMessage()} </div>}
              {showSucessMsg && <div className={styles.inputContainer}>{renderSuccessMessage()}</div>}
              <button type="submit" className={styles.requestButton}>
                Request
              </button>
            </form>
            <div className={styles.footerLinks}>
              {/* <a href="#">Create an account</a> */}
              <a href="/">Return to login</a>
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
})(withRouter(ForgetPassword));
