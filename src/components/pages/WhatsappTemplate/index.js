import React, { useState, useEffect } from 'react';

import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';

import Header from './../../organisms/Navbar';
import { useSelector } from 'react-redux';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import Notification from '../../organisms/Notification/notification';
import TemplateForm from '../../organisms/templateForm';
import WhatsappTemplatePopup from './WhatsappTemplatePopup';
import { WhatsappTemplateTable } from './WhatsappTemplateTable';
import { useHistory } from 'react-router';
import SideNavbar from '../../organisms/LeftSideBar';
import CustomNavbar from '../../organisms/CustomNavBar/CustomNavBar';

const WhatsappTemplatePage = () => {
  const [templateData, setTemplateData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [propsData, setPropsData] = useState({
    name: '',
    isActive: false,
    contact_list: null,
    template: null,
    schedule_date: null,
  });
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  let history = useHistory();
  const { userInfo } = useSelector((state) => state.user);

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState('');
  useEffect(() => {
    async function data() {
      getTemplateLists();
    }
    data();
  }, []);

  const deleteCampaign = (formData) => {
    let header = {
      Token: userInfo.token,
    };
    ApiService.del('/v1/getMessageTemplates/' + formData._id, header, {}, (res, err) => {
      if (res !== null) {
        setShowLoader(false);
        setSuccessMsg('Campaign List Deleted successfully');
        setShowSuccessMsg(true);
        setShowCreateUserPopup(false);
        getTemplateLists();
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const getTemplateLists = () => {
    setShowLoader(true);

    let url = `/v1/template/getall`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setTemplateData(res.results);
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const handleUserPopup = () => {
    history.push('create-template');
  };

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      {showErrorMsg && <Notification show={showErrorMsg} msg={ErrorMsg} type="error" />}

      {/* <Header /> */}
      {/* <CustomNavbar />
      <SideNavbar /> */}
      <div className="container-fluid cont-padd base-container">
        <div className="d-flex justify-content-between containerBackground">
          <h2 className="mb-0">Templates</h2>
          <div style={{ margin: 5 }}>
            <button className={[styles.applyBtn,"btn-primary"].join(' ')} onClick={handleUserPopup}>
              Create New Template
            </button>
          </div>
        </div>
        {showCreateUserPopup && (
          <WhatsappTemplatePopup
            show={showCreateUserPopup}
            hide={() => setShowCreateUserPopup(false)}
            propsData={propsData}
            getTemplateLists={getTemplateLists}
            isNew={true}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
            deleteCampaign={(e) => deleteCampaign(e)}
          />
        )}

        <div className="containerBackground">
          <WhatsappTemplateTable data={templateData} getTemplateLists={getTemplateLists} deleteCampaign={(e) => deleteCampaign(e)} />
        </div>
      </div>
    </>
  );
};

export default WhatsappTemplatePage;
