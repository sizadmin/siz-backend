import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import { CustomSelect } from '../../atom/CustomSelect/CustomSelect';
import AsyncSelect from 'react-select/async';
import _ from 'lodash';
import { handleIsRequiredError } from '../../../utils/Helper';
import Notification from '../../organisms/Notification/notification';
import axios from 'axios';
import { backendHost as API_URL } from '../../../config/config';
import closeIcon from './../../../assets/imgs/cross.png';
import { useSelector } from 'react-redux';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';

const ContactListPopup = (props) => {
  const handleClose = () => props.hide();
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState(props?.propsData);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isRequiredError, setIsRequiredError] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(props.show);
  const [CSVFile, setCSVFile] = useState(null);

  useEffect(() => {}, []);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: '100%',
      minHeight: '100%',
      width: '100%',
    }),
    menu: (base) => ({
      ...base,
      width: '100%',
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      height: '100%',
      maxHeight: '900px',
      overflowY: 'auto',
      padding: '0px 8px',
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: 40,
    }),
    input: (provided, state) => ({
      ...provided,
      height: 40,
      padding: 0,
      margin: 0,
    }),
    container: (provided, state) => ({
      ...provided,
      minWidth: '100%',
    }),
  };

  const onChangeVal = (e, field) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e.target.value,
      };
    });
  };

  const onChangePermissions = (selectedOptions) => {
    if (!selectedOptions) {
      selectedOptions = [];
    }
    setFormData((prevData) => ({
      ...prevData,
      phone_number: selectedOptions.map((permission) => permission),
    }));
  };

  const getContactNumbers = async (val) => {
    let options = [];
    let url = `/v1/marketing_users?value=`;
    let header = {
      Token: userInfo.token,
    };
    try {
      const response = await axios.get(API_URL.getAPIUrl() + url + val, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${header.Token}`,
        },
      });

      options = response.data.results.map((res) => ({
        label: res.first_name, // Adjust according to your API response structure
        value: res.phone_number, // Adjust according to your API response structure
        info: res,
      }));
      return options;
    } catch (error) {
      console.error('Error fetching contact numbers:', error);
      return [];
    }
  };

  const createContactList = () => {
    let header = {
      Token: userInfo.token,
    };
    setIsRequiredError(false);

    if (CSVFile) {
      handleCSVUpload();
      return;
    }


    if (props.isNew === true) {
      if (formData.name === '') {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);

      ApiService.post('/v1/contact_list', formData, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Contact List created successfully');
          setShowSuccessMsg(true);
          setShowPopup(false);
          setShowLoader(false);

          setTimeout(() => {
            handleClose();
          }, 3000);
          props.getContactLists();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    } else {
      if (formData.name === '') {
        setIsRequiredError(true);
        return;
      }
      setShowLoader(true);
      let payload = _.cloneDeep(formData);
      console.log(payload);

      ApiService.put('/v1/contact_list/' + payload._id, payload, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Contact List updated successfully');
          setShowSuccessMsg(true);
          setShowPopup(false);
          setShowLoader(false);
          setTimeout(() => {
            handleClose();
          }, 3000);
          props.getContactLists();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    }
  };

  const onChangeSelect = (e, field) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        [field]: e.value,
      };
    });
  };

  const loadOptions1 = async (inputValue, callback) => {
    if (!inputValue) {
      callback([]);
      return;
    }

    try {
      const options = await getContactNumbers(inputValue);
      callback(options);
    } catch (error) {
      console.error('Error loading options:', error);
      callback([]);
    }
  };
  const onSelectAll = (e) => {
    // setSelectAllContacts(!selectAllContacts);
    console.log(e, 'e');
    setFormData((prevData) => {
      return {
        ...prevData,
        select_all: e.target.checked,
        phone_number: e.target.checked === true ? [] : prevData.phone_number,
      };
    });
  };

  const handleCSVFileOnChange = (e) => {
    const csvFile = e.target.files[0];
    setCSVFile(csvFile);
  };

  const handleCSVUpload = (e) => {
    const formData1 = new FormData();
    formData1.append('file', CSVFile);
    formData1.append('contact_list_name', formData.name);
    formData1.append('isActive', formData.isActive);
    if(formData._id)     formData1.append('_id', formData._id);

  
    let header = {
      Token: userInfo.token,
      'Content-Type': 'multipart/form-data',
    };

    setShowLoader(true);

    ApiService.post('/v1/marketing_users/uploadCSV', formData1, header, (res, err) => {
      if (res !== null) {
        setSuccessMsg('CSV File Uploaded successfully');
        setShowSuccessMsg(true);
        // setTimeout(() => {
        setShowLoader(false);
        handleClose();
        props.getContactLists();
        // }, 3000);
      } else {
        setShowLoader(false);
        // setErrorMsg(err.message);
        // setShowErrorMsg(true);

        // setTimeout(() => {
        // setErrorMsg('');
        // setShowErrorMsg(false);
        // }, 3000);
      }
    });
  };
  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={successMsg} type="success" />}
      <Modal show={showPopup} onHide={handleClose} dialogClassName="modal-90w" className="my-modal modal-90w">
        <Modal.Header>
          <Modal.Title className={[styles.third_titile, 'd-flex justify-content-between w-100'].join(' ')}>
            {props.isNew === true ? 'Create New Contact List' : 'Edit Contact List'}
          </Modal.Title>
          <button onClick={handleClose} type="button" className="custom-close-button" aria-label="Close">
            <img src={closeIcon} alt="Close" className={'closeIcon'} />
          </button>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="row col-md-12 p-4">
              <div className={['col-md-10 m-auto', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Contact List Name:</h6>
                <div className={styles.modalElementDivStyle}>
                  <input type="text" className={styles.customInputStyle} value={formData.name} onChange={(e) => onChangeVal(e, 'name')} />
                  {(formData.name === null || formData.name === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>
              <div className={['col-md-10 m-auto', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Phone Numbers:</h6>
                <div className={styles.modalElementDivStyle}>
                  <AsyncSelect
                    className="modal-custom-input"
                    onChange={onChangePermissions}
                    defaultOptions
                    loadOptions={loadOptions1}
                    placeholder="Select Phone Numbers"
                    styles={customStyles}
                    value={formData?.phone_number?.map((first_name) => ({
                      label: first_name?.info?.phone_number ?? first_name.label,
                      value: first_name?.info?.phone_number ?? first_name.label,
                      ...first_name,
                    }))}
                    isMulti
                    isDisabled={formData?.select_all === true ? true : false}
                  />
                  <span className="mt-1 d-flex ">
                    Instead Select All Contacts
                    <input type="checkbox" checked={formData?.select_all} className="ml-2 cursor" onChange={async (e) => onSelectAll(e)} />
                  </span>
                </div>
              </div>

              <hr style={{ borderTop: '1px solid grey' }} className={['col-md-10', styles.modalElementStyle, styles.third_titile].join(' ')} />
              <div className={['col-md-10 m-auto', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Upload CSV:</h6>
                <div className={styles.modalElementDivStyle}>
                  <form encType="multipart/form-data">
                    <input type="file" id="fileUpload" name="file" onChange={(e) => handleCSVFileOnChange(e)} />
                  </form>
                </div>
              </div>
              <hr style={{ borderTop: '1px solid grey' }} className={['col-md-10', styles.modalElementStyle, styles.third_titile].join(' ')} />

              <div className={['col-md-10 m-auto', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Status :</h6>
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

              <div className={['col-md-10  m-auto justify-content-center', styles.modalElementStyle].join(' ')}>
                <div style={{ maxHeight: 200, overflowY: 'auto', width: '100%' }}>
                  <Table>
                    <Thead>
                      <Tr style={{ background: '#d1d1d1' }}>
                        <Th style={{ width: 40 }}>#</Th>
                        <Th>Name</Th>
                        <Th>Phone Number</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {props?.data?.length === 0 ? (
                        <Tr>
                          <Td colSpan="10">
                            <div className="w-100 text-center">No Contact Found</div>
                          </Td>
                        </Tr>
                      ) : (
                        <>
                          {formData?.phone_number?.length > 0 &&
                            formData?.phone_number?.map((user, i) => (
                              <React.Fragment key={i}>
                                <Tr style={{ borderBottom: '1px solid #e7d9d9' }}>
                                  <Td>{i + 1}</Td>
                                  <Td style={{ whiteSpace: 'nowrap', fontSize: 'small' }}>{user.label ? user.label : '-'}</Td>
                                  <Td style={{ fontSize: 'small' }}>{user.value}</Td>
                                  {/* <Td style={{ fontSize: 'small' }}>{user.isActive === true ? 'Active ' : 'In-active'}</Td> */}
                                </Tr>
                              </React.Fragment>
                            ))}
                        </>
                      )}
                    </Tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-primary" onClick={createContactList}>
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

export default ContactListPopup;
