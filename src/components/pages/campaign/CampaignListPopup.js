import { useEffect, useState } from 'react';
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
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import closeIcon from './../../../assets/imgs/cross.png';
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#f5f5f5',
    height: '50px', // Adjust height here
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'blue',
  },
  '& .MuiInputLabel-root': {
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: '10px', // Adjust as necessary,
    marginTop: '50px',
  },
}));
const CampaignListPopup = (props) => {
  const handleClose = () => props.hide();
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState(props?.propsData);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isRequiredError, setIsRequiredError] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  useEffect(() => {
    async function fetchData() {
      await getTemplates();
    }
    fetchData();
  }, []);
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
      zIndex: 99999,
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
  const onChangeDateTime = (datetime) => {
    setFormData((prevData) => ({
      ...prevData,
      schedule_date: datetime,
    }));
  };
  const onChangePermissions = (selectedOptions) => {
    if (!selectedOptions) {
      selectedOptions = [];
    }
    setFormData((prevData) => ({
      ...prevData,
      contact_list: selectedOptions,
    }));
  };
  const onChangeTemplate = (selectedOptions) => {
    if (!selectedOptions) {
      selectedOptions = [];
    }
    setFormData((prevData) => ({
      ...prevData,
      template: selectedOptions,
    }));
  };
  const getTemplates = async () => {
    let url = `/v1/template/getall`;

    let options = [];
    try {
      const response = await axios.get(API_URL.getAPIUrl() + url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: userInfo.token,
        },
      });
      options = response.data.results.map((res) => ({
        label: res.name, // Adjust according to your API response structure
        value: res._id, // Adjust according to your API response structure
      }));
      return options;
    } catch (error) {
      console.error('Error fetching contact list:', error);
      return [];
    }
  };
  const getContactLists = async (val) => {
    let options = [];
    let url = `/v1/contact_list?value=`;
    try {
      const response = await axios.get(API_URL.getAPIUrl() + url + val, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: userInfo.token,
        },
      });
      options = response.data.results.map((res) => ({
        label: res.name, // Adjust according to your API response structure
        value: res._id, // Adjust according to your API response structure
      }));
      return options;
    } catch (error) {
      console.error('Error fetching contact list:', error);
      return [];
    }
  };
  const createContactList = () => {
    setIsRequiredError(false);
    if (formData.name === '' || formData.contact_list === '' || formData.template === '') {
      setIsRequiredError(true);
      return;
    }
    let header = {
      Token: userInfo.token,
    };
    if (props.isNew === true) {
      setShowLoader(true);
      let payload = _.cloneDeep(formData);
      payload.contact_list = payload.contact_list.value;
      ApiService.post('/v1/campaign', payload, header, (res, err) => {
        if (res !== null) {
          props.setSuccessMsg('Campaign created successfully');
          props.setShowSuccessMsg(true);
          setShowLoader(false);
          handleClose();
          setTimeout(() => {
            props.setShowSuccessMsg(false);
          }, 3000);
          props.getCampaignLists();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    } else {
      setShowLoader(true);
      let payload = _.cloneDeep(formData);
      payload.contact_list = payload.contact_list.value;
      ApiService.put('/v1/campaign/' + payload._id, payload, header, (res, err) => {
        if (res !== null) {
          props.setSuccessMsg('Campaign updated successfully');
          props.setShowSuccessMsg(true);
          handleClose();
          setShowLoader(false);
          setTimeout(() => {
            props.setShowSuccessMsg(false);
          }, 3000);
          props.getCampaignLists();
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

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={successMsg} type="success" />}
      <Modal show={props.show} onHide={handleClose} dialogClassName="modal-90w" className="my-modal modal-90w">
        <Modal.Header>
          <Modal.Title className={[styles.third_titile, 'd-flex justify-content-between w-100'].join(' ')}>
            {props.isNew === true ? 'Create New Campaign' : 'Edit Campaign'}
          </Modal.Title>
          <button onClick={handleClose} type="button" className="custom-close-button" aria-label="Close">
            <img src={closeIcon} alt="Close" className={'closeIcon'} />
          </button>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="row col-md-12 p-4">
              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Campaign Name:</h6>
                <div className={styles.modalElementDivStyle}>
                  <input type="text" className={styles.customInputStyle} value={formData.name} onChange={(e) => onChangeVal(e, 'name')} />
                  {(formData.name === null || formData.name === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>
              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Contact List:</h6>
                <div className={styles.modalElementDivStyle}>
                  <AsyncSelect
                    className="modal-custom-input"
                    onChange={onChangePermissions}
                    defaultOptions
                    loadOptions={async (inputValue, callback) => {
                      if (inputValue === '') {
                        let options = await getContactLists(inputValue);
                        setTimeout(() => {
                          callback(options);
                        }, 1000);
                        callback(options);
                      } else {
                        let options = await getContactLists(inputValue);
                        setTimeout(() => {
                          callback(options);
                        }, 1000);
                        callback(options);
                      }
                    }}
                    placeholder="Select Contact List"
                    styles={customStyles}
                    value={
                      formData?.contact_list !== null && Object.keys(formData?.contact_list).length > 0
                        ? { label: formData?.contact_list.label, value: formData?.contact_list.value }
                        : null
                    }
                  />
                  {(formData.contact_list === null || formData.contact_list === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>
              <div className={['col-md-10', styles.modalElementStyle].join(' ')} style={{ alignItems: 'baseline' }}>
                <h6 className={styles.third_titile}>Whatsapp Template:</h6>
                <div className={styles.modalElementDivStyle}>
                  <AsyncSelect
                    className="modal-custom-input mb-2"
                    onChange={onChangeTemplate}
                    defaultOptions
                    loadOptions={async (inputValue, callback) => {
                      if (inputValue === '') {
                        let options = await getTemplates(inputValue);
                        setTimeout(() => {
                          callback(options);
                        }, 1000);
                        callback(options);
                      } else {
                        let options = await getTemplates(inputValue);
                        setTimeout(() => {
                          callback(options);
                        }, 1000);
                        callback(options);
                      }
                    }}
                    placeholder="Select Template"
                    styles={customStyles}
                    value={formData?.template !== null && Object.keys(formData?.template).length > 0 ? { label: formData?.template.label, value: formData?.template.value } : null}
                  />
                  {(formData?.template === null || formData?.template === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                  {/* {renderComponents(templatesData.data.data.filter((itm) => itm.name === formData?.template?.label))} */}
                </div>
              </div>
              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
                <h6 className={styles.third_titile}>Schedule Date-Time:</h6>
                <div className={styles.modalElementDivStyle}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <DateTimePicker
                        label="Select Date & Time"
                        value={formData.schedule_date !== null ? dayjs(formData.schedule_date) : ''}
                        onChange={onChangeDateTime}
                        renderInput={(params) => <StyledTextField {...params} />}
                      />
                    </Box>
                  </LocalizationProvider>
                  {(formData.schedule_date === null || formData.schedule_date === '') && isRequiredError && <div>{handleIsRequiredError()}</div>}
                </div>
              </div>
              <div className={['col-md-10', styles.modalElementStyle].join(' ')}>
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
              {/* {formData?.template && (
                <TemplatePreview templateName={formData?.template.label} languageCode={formData?.template.language} policy={'text'} components={formData?.template.components} />
              )} */}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {props.isNew === false && (
            <Button
              variant="secondary"
              onClick={() => props.deleteCampaign(formData)}
              style={{
                background: 'rgb(175, 16, 16)',
                borderColor: 'rgb(175, 16, 16)',
              }}
            >
              Delete Campaign
            </Button>
          )}
          <Button
            variant="secondary"
            style={{
              background: 'rgb(175, 16, 16)',
              borderColor: 'rgb(175, 16, 16)',
            }}
            onClick={createContactList}
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
};
export default CampaignListPopup;
