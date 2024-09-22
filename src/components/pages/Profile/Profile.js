// src/components/ProfileEdit.js
import React, { useEffect, useState } from 'react';
import styles from './Profile.module.css';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import Notification from '../../organisms/Notification/notification';
import { useDispatch, useSelector } from 'react-redux';
import ApiService from '../../../utils/middleware/ApiService';
import { setUser } from '../../../utils/redux/actions';

const Profile = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    phone_number: '',
  });
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const { userInfo } = useSelector((state) => state.user);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value, 'kkk');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    setShowLoader(true);

    e.preventDefault();
    let payload = formData;
    payload.role = payload.role._id;
    // delete payload.role
    let header = {
      Token: userInfo.token,
    };
    ApiService.put('/v1/user/' + userInfo.loggedUser._id, formData, header, (res, err) => {
      if (res !== null) {
        setFormData(res.result);
        let data = {};
        data.loggedUser = res.result;
        data.token = userInfo.token
        dispatch(
          setUser({
            userInfo: data,
          })
        );
        setShowLoader(false);
        setSuccessMsg('User Information Updated successfully');
        setShowSuccessMsg(true);

        setTimeout(() => {
          setSuccessMsg('');
          setShowSuccessMsg(false);
        }, 3000);
      } else {
        console.log(err);
        setShowLoader(false);
        setErrorMsg(err.message);
        setShowErrorMsg(true);

        setTimeout(() => {
          setErrorMsg('');
          setShowErrorMsg(false);
        }, 3000);
      }
    });
  };

  useEffect(() => {
    async function data() {
      ApiService.get('/v1/user/' + userInfo.loggedUser._id, {}, {}, (res, err) => {
        if (res !== null) {
          setFormData(res.results[0]);
          setShowLoader(false);
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    }
    data();
  }, []);

  return (
    <>
      {/* <div className="container mt-5"> */}
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      {showErrorMsg && <Notification show={showErrorMsg} msg={ErrorMsg} type="error" />}

      {/* <Header /> */}
      <div className="container-fluid cont-padd base-container">
        <form onSubmit={handleSubmit} className={[styles.form, 'containerBackground mt-5'].join(' ')}>
          <h2 className="mb-0 text-center">My Profile</h2>

          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input type="text" className="form-control" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input type="text" className="form-control" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required disabled />
          </div>
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input type="number" className="form-control" id="phone_number" name="phone_number" value={formData?.phone_number} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select className="form-control" id="role" name="role" value={formData.role?.role_name} onChange={handleChange} disabled>
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Lender">Lender</option>
              <option value="Dry Cleaner">Dry-Cleaner</option>
            </select>
          </div>
          <div className="text-center mt-5">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;
