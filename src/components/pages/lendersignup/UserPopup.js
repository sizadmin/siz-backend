import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import dayjs from 'dayjs';
import _ from 'lodash';
import moment from 'moment/moment';
import { CustomSelect } from '../../atom/CustomSelect/CustomSelect';
import { emailRegx, handleCustomErrorMsg, handleIsRequiredError, phoneNumberRegx } from '../../../utils/Helper';
import Notification from '../../organisms/Notification/notification';
import closeIcon from '../../../assets/imgs/cross.png';
import Form from 'react-bootstrap/Form';

function UserPopup(props) {
  const handleClose = () => props.hide();
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState(props?.propsData);
  const [showLenderInfo, setShowLenderInfo] = useState(false);

  const [showLenderBankInfo, setShowLenderBankInfo] = useState(false);

  const [isRequiredError, setIsRequiredError] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [showPopup, setShowPopup] = useState(props.show);

  useEffect(() => {
    let findRole = props.rolesData.find((role) => role.value === formData.role?._id);
    if (findRole && findRole.label === 'Lender') {
      setShowLenderInfo(true);
      setShowLenderBankInfo(true);
    } else {
      setShowLenderInfo(false);
      setShowLenderBankInfo(false);
    }

    if (emailRegx.test(formData.email)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }

    if (phoneNumberRegx.test(formData.phone_number)) {
      setIsPhoneValid(true);
    } else {
      setIsPhoneValid(false);
    }
    if (formData.permission && formData.permission.length > 0) {
      let newPermissions = formData.permission.map((itm) => {
        let el = props.permissionData.find((element) => element.value === itm._id);
        el.checked = true;
        return el;
      });

      setFormData((prevData) => {
        return {
          ...prevData,
          permission: newPermissions,
          role: formData.role?._id,
        };
      });
    } else {
      setFormData((prevData) => {
        return {
          ...prevData,
          permission: [],
          role: formData.role?._id,
        };
      });
    }
  }, []);

  const onChangeSelect = (e, field) => {
    if (field === 'role') {
      let findRole = props.rolesData.find((role) => role.value === e.value);

      if (findRole && findRole.label === 'Lender') {
        setShowLenderInfo(true);
        setShowLenderBankInfo(true);
      } else {
        setShowLenderInfo(false);

        setShowLenderBankInfo(false);
      }
    }
    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e.value,
      };
    });
  };
  const onChangeVal = (e, field) => {
    if (field === 'email') {
      if (emailRegx.test(e.target.value)) {
        setIsEmailValid(true);
      } else {
        setIsEmailValid(false);
      }
    }
    if (field === 'phone_number') {
      if (phoneNumberRegx.test(e.target.value)) {
        setIsPhoneValid(true);
      } else {
        setIsPhoneValid(false);
      }
    }

    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e.target.value,
      };
    });
  };
  const updateDate = (e, field) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e == null ? null : moment(dayjs(e).toString()).format('YYYY-MM-DD'),
      };
    });
  };

  const createNewUser = () => {
    setIsRequiredError(false);
    formData.first_name = formData.first_name.trimEnd();
    formData.last_name = formData.last_name.trimEnd();
    formData.permission = formData.permission.map((element) => element?.value || element);
    if (props.isNew === true) {
      if (
        formData.first_name === '' ||
        // formData.last_name === "" ||
        formData.email === '' ||
        formData.password === '' ||
        formData.role === '' ||
        !isEmailValid ||
        !isPhoneValid
      ) {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);
      delete formData.lender_id;
      ApiService.post('/v1/user', formData, {}, (res, err) => {
        if (res !== null) {
          setSuccessMsg('User created successfully');
          setShowSuccessMsg(true);
          setShowPopup(false);
          setShowLoader(false);
          setTimeout(() => {
            handleClose();
          }, 3000);
          props.getUsers();
          props.getUsers();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    } else {
      if (
        formData.first_name === '' ||
        // formData.last_name === "" ||
        formData.email === '' ||
        formData.role === '' ||
        !isEmailValid ||
        !isPhoneValid
      ) {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);
      let payload = _.cloneDeep(formData);
      payload.lender_info = payload.lender_info !== null && payload.lender_info.length > 0 ? payload.lender_info[0]._id : null;
      payload.role = payload.role !== null ? payload.role : null;
      delete payload.lender_id;
      ApiService.put('/v1/user/' + payload._id, payload, {}, (res, err) => {
        if (res !== null) {
          setSuccessMsg('User updated successfully');
          setShowSuccessMsg(true);
          setShowPopup(false);
          setShowLoader(false);
          setTimeout(() => {
            handleClose();
          }, 3000);
          props.getUsers();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    }
  };
  const handleToggle = (index) => {
    const updatedItems = [...props.permissionData];
    updatedItems[index].checked = !updatedItems[index].checked;
    setFormData((prevData) => {
      return {
        ...prevData,
        permission: updatedItems.filter((item) => item.checked).map((item) => item.value),
      };
    });
  };
  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      <Modal show={props.show} onHide={() => handleClose} dialogClassName="modal-90w" className="my-modal modal-90w">
        <Modal.Header>
          <Modal.Title className={[styles.third_titile, 'd-flex justify-content-between'].join(' ')}>
            {props.isNew === true ? 'Create User' : 'Edit User'}
            {/* <span>X</span> */}
          </Modal.Title>
          <button onClick={handleClose} type="button" className="custom-close-button" aria-label="Close">
            <img src={closeIcon} alt="Close" className={'closeIcon'} />
          </button>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="containerBackground">
              <h6>User Details:</h6>
              <div className="row justify-content-center d-flex col-md-12 p-4 ">
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>First Name:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="text" className={styles.customInputStyle} value={formData.first_name} onChange={(e) => onChangeVal(e, 'first_name')} />
                    {formData.first_name === null && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Last Name:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="text" className={styles.customInputStyle} value={formData.last_name} onChange={(e) => onChangeVal(e, 'last_name')} />
                    {formData.last_name === null && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Email:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="email" className={styles.customInputStyle} value={formData.email} onChange={(e) => onChangeVal(e, 'email')} />
                    {(formData.email === null || formData.email === '') && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                    {isEmailValid === false && formData.email !== '' && isRequiredError === true && <div>{handleCustomErrorMsg('Invalid Email')}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Username:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="text" className={styles.customInputStyle} value={formData.username} onChange={(e) => onChangeVal(e, 'username')} />
                    {(formData.username === null || formData.username === '') && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Password:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="text" className={styles.customInputStyle} value={formData.password} onChange={(e) => onChangeVal(e, 'password')} />
                    {props.isNew === true && (formData.last_name === null || formData.last_name === '') && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Status:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <CustomSelect
                      options={[
                        { value: true, label: 'Active' },
                        { value: false, label: 'In-active' },
                      ]}
                      value={formData.isActive}
                      onChange={(e) => onChangeSelect(e, 'isActive')}
                    />
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Phone Number:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <input type="number" className={styles.customInputStyle} onChange={(e) => onChangeVal(e, 'phone_number')} value={formData.phone_number} />
                    {isPhoneValid === false && formData.email !== '' && isRequiredError === true && <div>{handleCustomErrorMsg('Invalid Phone number')}</div>}
                  </div>
                </div>

                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Role:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <CustomSelect
                      options={props.rolesData}
                      onChange={(e) => onChangeSelect(e, 'role')}
                      value={props.isNew === true ? null : formData.role !== null && Object.keys(formData.role).length > 0 ? formData.role : formData.role}
                    />
                    {(formData.role === null || formData.role === '') && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>
                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Lender Type:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <CustomSelect
                      options={[
                        { value: 'Managed Closet', label: 'Managed Closet' },
                        { value: 'P2P', label: 'P2P' },
                      ]}
                      value={formData.lender_type}
                      onChange={(e) => onChangeSelect(e, 'lender_type')}
                    />
                    {(formData.lender_type === null || formData.lender_type === '') && isRequiredError === true && <div>{handleIsRequiredError()}</div>}
                  </div>
                </div>

                <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Address:</h6>
                  <div className={styles.modalElementDivStyle}>
                    <textarea
                      type="text"
                      as="textarea"
                      className={styles.customTextareaStyle}
                      value={formData.address}
                      onChange={(e) => onChangeVal(e, 'address')}
                      rows={4}
                      cols={40}
                    />
                  </div>
                </div>

                <div className={['col-md-12', styles.modalElementStyle].join(' ')}>
                  <h6 className={styles.third_titile}>Permission:</h6>
                </div>
                <div className={['col-md-12', styles.modalElementStyle].join(' ')}>
                  <div className="d-flex flex-wrap justify-content-start">
                    {props.permissionData.map((item, index) => (
                      <div className="col-md-4 col-sm-6 mb-3 p-0" key={item.id} style={{ minWidth: '280px', flex: '1 1 auto' }}>
                        <Form.Check
                          type="switch"
                          id={item.value}
                          label={item.label}
                          checked={item.checked || false}
                          onChange={() => handleToggle(index)}
                          title={item.label}
                          className={['toggle-gradient', styles.togglebtn].join(' ')}
                          style={{ minWidth: '300px', flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        />
                      </div>
                    ))}

                    {/* Dynamic Dummy Divs to Align Elements */}
                    {Array.from({ length: (4 - (props.permissionData.length % 4)) % 4 }).map((_, i) => (
                      <div
                        key={`dummy-${i}`}
                        className="col-md-4 col-sm-6 mb-3 p-0"
                        style={{ minWidth: '300px', flex: '1 1 auto', visibility: 'hidden' }} // Make the dummy div invisible
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {showLenderInfo && (
              <div className="containerBackground">
                <h6>Lender Details:</h6>
                <div className="row col-md-12 p-4">
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Lender Id:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="text" className={styles.customInputStyle} value={formData.lender_id} disabled={true} onChange={(e) => onChangeVal(e, 'lender_id')} />
                    </div>
                  </div>
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Whatsapp Phone Number:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="number" className={styles.customInputStyle} value={formData.phone_number_whatsapp} onChange={(e) => onChangeVal(e, 'phone_number_whatsapp')} />
                    </div>
                  </div>
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Shopify Id:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="text" className={styles.customInputStyle} value={formData.shopify_id} onChange={(e) => onChangeVal(e, 'shopify_id')} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showLenderBankInfo && (
              <div className="containerBackground">
                <h6>Bank Details:</h6>
                <div className="row col-md-12 p-4">
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Account Name:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="text" className={styles.customInputStyle} value={formData.account_name} onChange={(e) => onChangeVal(e, 'account_name')} />
                    </div>
                  </div>
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>Account Number (AED):</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="number" className={styles.customInputStyle} value={formData.account_number} onChange={(e) => onChangeVal(e, 'account_number')} />
                    </div>
                  </div>
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>IBAN (AED):</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="text" className={styles.customInputStyle} value={formData.iban_number} onChange={(e) => onChangeVal(e, 'iban_number')} />
                    </div>
                  </div>
                  <div className={['col-md-6', styles.modalElementStyle].join(' ')}>
                    <h6 className={styles.third_titile}>SWIFT Code:</h6>
                    <div className={styles.modalElementDivStyle}>
                      <input type="text" className={styles.customInputStyle} value={formData.swift_code} onChange={(e) => onChangeVal(e, 'swift_code')} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {props.isNew === false && (
            <Button
              variant="secondary"
              onClick={() => props.deleteUser(formData)}
              style={{
                background: 'rgb(175, 16, 16)',
                borderColor: 'rgb(175, 16, 16)',
              }}
            >
              Delete User
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={createNewUser}
            style={{
              background: 'rgb(175, 16, 16)',
              borderColor: 'rgb(175, 16, 16)',
            }}
          >
            {props.isNew === true ? 'Save' : 'Update'}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserPopup;
