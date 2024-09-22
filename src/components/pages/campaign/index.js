import React, { useState, useEffect } from 'react';

import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';

import Header from './../../organisms/Navbar';
import { useSelector } from 'react-redux';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import Notification from '../../organisms/Notification/notification';
import { CampaignListTable } from './CampaignListTable';
import CampaignListPopup from './CampaignListPopup';

const Campaign = () => {
  const [campaignData, setCampaignData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [propsData, setPropsData] = useState({
    name: '',
    isActive: false,
    contact_list: null,
    template: null,
    schedule_date: null,
  });
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);

  const { userInfo } = useSelector((state) => state.user);

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function data() {
      getCampaignLists();
    }
    data();
  }, []);

  const deleteCampaign = (formData) => {
    let header = {
      Token: userInfo.token,
    };
    ApiService.del('/v1/campaign/' + formData._id, header, {}, (res, err) => {
      if (res !== null) {
        setShowLoader(false);
        setSuccessMsg('Campaign List Deleted successfully');
        setShowSuccessMsg(true);
        setShowCreateUserPopup(false);
        getCampaignLists();
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const getCampaignLists = () => {
    setShowLoader(true);

    let url = `/v1/campaign`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setCampaignData(res.results);
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const handleUserPopup = () => {
    setShowCreateUserPopup(true);
  };

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      {/* <Header /> */}

      <div className="container-fluid cont-padd base-container">
        <div className="d-flex justify-content-between containerBackground">
          <h2 className="mb-0">Campaigns</h2>
          <div style={{ margin: 5 }}>
            <button className={[styles.applyBtn, 'btn-primary'].join(' ')} onClick={handleUserPopup}>
              Create New Campaign
            </button>
          </div>
        </div>
        {showCreateUserPopup && (
          <CampaignListPopup
            show={showCreateUserPopup}
            hide={() => setShowCreateUserPopup(false)}
            propsData={propsData}
            getCampaignLists={getCampaignLists}
            isNew={true}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
            // deleteCampaign={(e) => deleteCampaign(e)}
          />
        )}

        <div className="containerBackground">
          <CampaignListTable
            data={campaignData}
            getCampaignLists={getCampaignLists}
            onDelete={(e) => deleteCampaign(e)}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
          />
        </div>
      </div>
    </>
  );
};

export default Campaign;
