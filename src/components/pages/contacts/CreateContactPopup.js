import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import { handleIsRequiredError } from '../../../utils/Helper';
import Notification from '../../organisms/Notification/notification';
import closeIcon from './../../../assets/imgs/cross.png';
import { useSelector } from 'react-redux';

const CreateContactPopup = (props) => {
  const handleClose = () => props.hide();
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState(props?.propsData);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isRequiredError, setIsRequiredError] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState('');
  const [CSVFile, setCSVFile] = useState(null);
  const [showPopup, setShowPopup] = useState(props.show);

  useEffect(() => {
    console.log(props, 'props');
  }, []);

  const onChangeVal = (e, field) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e.target.value,
      };
    });
  };

  const createContact = () => {
    let header = {
      Token: userInfo.token,
    };
    setIsRequiredError(false);

    if (CSVFile) {
      handleCSVUpload();
      return;
    }

    if (props.isNew === true) {
      if (formData.first_name === '' || formData.last_name === '' || formData.phone_number === '') {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);

      ApiService.post('/v1/marketing_users', formData, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Contact created successfully');
          setShowLoader(false);
          setShowSuccessMsg(true);
          setShowPopup(false);
          setTimeout(() => {
            handleClose();
          }, 3000);
        } else {
          setShowLoader(false);
          setErrorMsg(err.message);
          setShowErrorMsg(true);

          setTimeout(() => {
            setErrorMsg('');
            setShowErrorMsg(false);
          }, 3000);
        }
      });
    } else {
      if (formData.first_name === '' || formData.last_name === '' || formData.phone_number === '') {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);

      ApiService.put('/v1/marketing_users/' + formData._id, formData, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Contact updated successfully');
          setShowSuccessMsg(true);
          setShowLoader(false);
          setShowPopup(false);
          setTimeout(() => {
            handleClose();
          }, 3000);
        } else {
          setShowLoader(false);
          setErrorMsg(err.message);
          setShowErrorMsg(true);

          setTimeout(() => {
            setErrorMsg('');
            setShowErrorMsg(false);
          }, 3000);
        }
      });
    }
  };

  const handleCSVUpload = (e) => {
    const formData = new FormData();
    formData.append('file', CSVFile);

    let header = {
      Token: userInfo.token,
      'Content-Type': 'multipart/form-data',
    };

    setShowLoader(true);

    ApiService.post('/v1/marketing_users/uploadCSV', formData, header, (res, err) => {
      if (res !== null) {
        setSuccessMsg('CSV File Uploaded successfully');
        setShowSuccessMsg(true);
        // setTimeout(() => {
        setShowLoader(false);
        handleClose();
        // }, 3000);
      } else {
        setShowLoader(false);
        setErrorMsg(err.message);
        setShowErrorMsg(true);

        // setTimeout(() => {
        setErrorMsg('');
        setShowErrorMsg(false);
        // }, 3000);
      }
    });
  };
  const handleCSVFileOnChange = (e) => {
    const csvFile = e.target.files[0];
    setCSVFile(csvFile);
  };
  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showErrorMsg && <Notification show={showErrorMsg} msg={ErrorMsg} type="error" />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={successMsg} type="success" />}
      <Modal show={showPopup} onHide={handleClose} dialogClassName="modal-90w" className="my-modal modal-90w">
        <Modal.Header>
          <Modal.Title className={[styles.third_titile, 'd-flex justify-content-between w-100'].join(' ')}>
            {props.isNew === true ? 'Create New Contact' : 'Edit Contact'}
          </Modal.Title>
          <button onClick={handleClose} type="button" className="custom-close-button" aria-label="Close">
            <img src={closeIcon} alt="Close" className={'closeIcon'} />
          </button>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="row col-md-12 p-4">
              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>First Name:</h6>
                <div className={styles.modalElementDivStyle}>
                  <input type="text" className={styles.customInputStyle} value={formData.first_name} onChange={(e) => onChangeVal(e, 'first_name')} />
                  {(formData.first_name === null || formData.first_name === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>

              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Last Name:</h6>
                <div className={styles.modalElementDivStyle}>
                  <input type="text" className={styles.customInputStyle} value={formData.last_name} onChange={(e) => onChangeVal(e, 'last_name')} />
                  {(formData.last_name === null || formData.last_name === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>

              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Phone Number:</h6>
                <div className={styles.modalElementDivStyle}>
                  <input type="text" className={styles.customInputStyle} value={formData.phone_number} onChange={(e) => onChangeVal(e, 'phone_number')} />
                  {(formData.phone_number === null || formData.phone_number === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>
              {props.isNew === true && (
                <>
                  <hr style={{ borderTop: '1px solid grey' }} className={['col-md-10', styles.modalElementStyle, styles.third_titile].join(' ')} />
                  <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Upload CSV:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <form encType="multipart/form-data">
                        <input type="file" id="fileUpload" name="file" onChange={(e) => handleCSVFileOnChange(e)} />
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button  className="btn-primary" onClick={createContact}>
            {props.isNew === true ? 'Save' : 'Update'}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateContactPopup;
