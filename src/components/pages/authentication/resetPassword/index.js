import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import styles from "../index.module.css";
import Logo from "./../../../../assets/imgs/LOGO.jpeg";
import ApiService from "../../../../utils/middleware/ApiService";
import { Modal } from "react-bootstrap";
import ActivityLoader from "../../../atom/ActivityLoader/ActivityLoader";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword = (props) => {
  let query = useQuery();
  const id = query.get("id");
  const token = query.get("token");
  const userIsLogedIn = !(id && token);

  const [errorMessages, setErrorMessages] = useState({});
  const [showInvalidToken, setShowInvalidToken] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [showSucessMsg, setShowSucessMsg] = useState(false);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userIsLogedIn){
      checkValidToken()
    }else{
      setShowLoader(false)
    }
  }, []);


  const checkValidToken = () => {
    let payload = {
      userId: id,
      token: token,
    };
    ApiService.post("/v1/checkResetPasswordToken", payload, null, (res, err) => {
      if (err === null) {
        setShowSucessMsg({ message: res.message });
        setShowLoader(false);
      } else {
        setShowInvalidToken(true)
        // console.log(err);
        // setErrorMessages({ message: err.mesage });
        setShowLoader(false);
      }
    });

  }

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();

    const { confirmPass, pass, oldPass } = document.forms[0];
    if (
      pass.value.length < 8 ||
      (userIsLogedIn && oldPass && oldPass?.value?.length < 8)
    ) {
      setErrorMessages({ message: "Password must be at least 8 characters" });
      return;
    }

    if (confirmPass.value !== pass.value) {
      setErrorMessages({ message: "Password mismatch" });
      return;
    }
    setShowLoader(true);

    if (userIsLogedIn) {
      let payload = {
        userId: userInfo.loggedUser._id,
        oldpassword: oldPass.value,
        password: pass.value,
      };
      let header = { Token: userInfo.token };
      ApiService.post("/v1/changepassword", payload, header, (res, err) => {
        if (err === null) {
          setShowSucessMsg({ message: res.message });
          setShowLoader(false);
        } else {
          console.log(err);
          setErrorMessages({ message: err.mesage });
          setShowLoader(false);
        }
      });
    } else {
      let payload = {
        userId: id,
        token: token,
        password: pass.value,
      };
      ApiService.post("/v1/resetpassword", payload, null, (res, err) => {
        if (err === null) {
          setShowSucessMsg({ message: res.message });
          setShowLoader(false);
        } else {
          console.log(err);
          setErrorMessages({ message: err.mesage });
          setShowLoader(false);
        }
      });
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = () => (
    <label className={styles.error}>{errorMessages.message}</label>
  );
  // Generate JSX code for success message
  const renderSuccessMessage = () =>
    showSucessMsg &&
    showSucessMsg.message && (
      <label className={styles.success}>{showSucessMsg.message} </label>
    );

  // JSX code for login form
  const renderForm = (
    <div className={styles.form}>
      <form onSubmit={handleSubmit}>
        {userIsLogedIn && (
          <div className={styles.inputContainer}>
            <label>Enter old Password </label>
            <input type="password" name="oldPass" required />
          </div>
        )}
        <div className={styles.inputContainer}>
          <label>Enter new password </label>
          <input type="password" name="pass" required />
        </div>
        <div className={styles.inputContainer}>
          <label>Confirm password </label>
          <input type="password" name="confirmPass" required />
          {renderErrorMessage()}
        </div>

        <div className={styles.buttonContainer}>
          <input type="submit" />
        </div>
      </form>
    </div>
  );

  return (
    <>
      {/* {userIsLogedIn && !userInfo.loggedUser.isFirstLogin && <Navbar />} */}
      {showLoader ? <ActivityLoader show={showLoader} /> :
        <>
          {
            showInvalidToken ?
              <div className={styles.app}>
                <h1 className="title "> The password reset token is expired or invalid </h1>
                <a className={styles.link} href="/">
                  Login
                </a>
              </div> :
              <div className={styles.app}>
                {!userIsLogedIn && (
                  <img src={Logo} alt="logo" className={styles.logoStyle} />
                )}

                <div className={styles.loginForm}>
                  <div className={styles.title}>
                    {userIsLogedIn ? "Change" : "Reset"} Password
                  </div>
                  {renderForm}
                </div>
              </div>
          }
          <Modal
            show={showSucessMsg && showSucessMsg.message}
            onHide={setShowSucessMsg}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Body>
              {showSucessMsg && showSucessMsg.message && renderSuccessMessage()}
            </Modal.Body>
            <Modal.Footer>
              {userIsLogedIn ? (
                <a className={styles.link} href="/kpiDashboard">
                  Ok
                </a>
              ) : (
                <a className={styles.link} href="/">
                  Login
                </a>
              )}
            </Modal.Footer>
          </Modal>
        </>}
    </>
  );
};

export default ResetPassword;
