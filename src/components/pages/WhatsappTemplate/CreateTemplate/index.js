import React, { useState, useEffect } from 'react';
import ApiService from '../../../../utils/middleware/ApiService';

import { useSelector } from 'react-redux';
import ActivityLoader from '../../../atom/ActivityLoader/ActivityLoader';
import WhatsAppTemplateCreator from '../testFile';
import { useHistory, useParams } from 'react-router';

const CreateTemplate = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { templateId } = useParams() || null;

  const [formData, setFormData] = useState();
  const [originalData, setOriginalData] = useState();

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    async function data() {
      if (templateId) {
        getTemplateLists();
      }
    }
    data();
  }, []);

  const getTemplateLists = () => {
    setShowLoader(true);

    let url = `/v1/template/${templateId}`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setFormData(res.results[0]);
        setOriginalData(res.results[0])
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}

      <div className="container-fluid base-container" style={{ height: '100vh' }}>
        <WhatsAppTemplateCreator template={formData} originalData={originalData}/>
      </div>
    </>
  );
};

export default CreateTemplate;
