import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import _ from 'lodash';
import Notification from '../../organisms/Notification/notification';
import axios from 'axios';
import { backendHost as API_URL } from '../../../config/config';
import { useSelector } from 'react-redux';
// import { SAMPLE_DATA_WHATSAPP_TEMPLATES } from '../../../utils/helper/helperData';
import closeIcon from './../../../assets/imgs/cross.png';
import WhatsAppTemplateCreator from './testFile';

const WhatsappTemplatePopup = (props) => {
  const handleClose = () => props.hide();
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState(props?.propsData);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isRequiredError, setIsRequiredError] = useState(false);
  const [templatesData, setTemplatesData] = useState([]);

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    console.log(formData, 'formData');
    getTemplates();
  }, []);

  const getTemplates = async () => {
    let url = `/v1/getMessageTemplates`;

    try {
      const response = await axios.get(API_URL.getAPIUrl() + url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: userInfo.token,
        },
      });

      setTemplatesData(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  };

  const createTemplate = () => {
    console.log(formData);
    return;
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
          setSuccessMsg('Campaign created successfully');
          setShowSuccessMsg(true);
          setTimeout(() => {
            setShowLoader(false);
            handleClose();
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
          setSuccessMsg('Campaign updated successfully');
          setShowSuccessMsg(true);
          setTimeout(() => {
            setShowLoader(false);
            handleClose();
          }, 3000);
          props.getCampaignLists();
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    }
  };

  
  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={successMsg} type="success" />}
      <Modal show={props.show} onHide={handleClose} dialogClassName="modal-90w" className="my-modal modal-90w">
        <Modal.Header>
          <Modal.Title className={[styles.third_titile, 'd-flex justify-content-between w-100'].join(' ')}>
            {props.isNew === true ? 'Create New Messaging Template' : 'Edit Messaging Template'}
          </Modal.Title>
          <button onClick={handleClose} type="button" className="custom-close-button" aria-label="Close">
            <img src={closeIcon} alt="Close" className={'closeIcon'} />
          </button>
        </Modal.Header>
        <Modal.Body>
          <WhatsAppTemplateCreator template={formData} updatedTemplate={(e)=>{console.log(e,"e")}}/>
        </Modal.Body>
        <Modal.Footer>
          {/* {props.isNew === false && (
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
          )} */}
          <Button
            className='btn-primary'
            onClick={createTemplate}
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

export default WhatsappTemplatePopup;
