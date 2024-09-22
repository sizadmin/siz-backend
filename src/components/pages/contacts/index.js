import React, { useState, useEffect } from 'react';

import styles from './index.module.css';
import ApiService from '../../../utils/middleware/ApiService';

// import Header from './../../organisms/Navbar';
import { useSelector } from 'react-redux';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import { ContactLisTable } from './ContactListTable';
import ContactListPopup from './ContactListPopup';
import Notification from '../../organisms/Notification/notification';
import CreateContactPopup from './CreateContactPopup';
import { ContactTable } from './ContactTable';
// import { Digital } from 'react-activity';
import CustomPopup from '../../organisms/CustomPopup/customPopup';

const Contacts = () => {
  const [contactListData, setContactListData] = useState([]);
  const [contactData, setContactData] = useState([]);

  const [showCreateContactPopup, setShowCreateContactPopup] = useState(false);

  const [showLoader, setShowLoader] = useState(false);
  const [showLoaderTable, setShowLoaderTable] = useState(false);

  const [propsData, setPropsData] = useState({
    name: '',
    isActive: false,
    phone_number: [],
    select_all: false,
  });

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    isActive: false,
    phone_number: '',
  });
  const [showCreateContactListPopup, setShowCreateContactListPopup] = useState(false);

  const { userInfo } = useSelector((state) => state.user);

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');
  const [contactSearchText, setContactSearchText] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    async function data() {
      getContactLists();
      getContacts();
    }
    data();
  }, []);

  const deleteContactList = (formData) => {
    // console.log(formData, 'fff');
    let header = {
      Token: userInfo.token,
    };
    // ApiService.del('/v1/contact_list/' + formData._id, header, {}, (res, err) => {
    ApiService.del('/v1/contact_list/' + formData._id, {}, header, (res, err) => {
      if (res !== null) {
        setShowLoader(false);
        setSuccessMsg('Contact List Deleted successfully');
        setShowSuccessMsg(true);
        // setShowCreateContactListPopup(false);
        getContactLists();
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const getContactLists = () => {
    setShowLoader(true);

    let url = `/v1/contact_list`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setContactListData(res.results);
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };
  const getContacts = () => {
    setShowLoaderTable(true);

    let url = `/v1/marketing_users`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setContactData(res.results);
        setShowLoaderTable(false);
      } else {
        console.log(err);
        setShowLoaderTable(false);
      }
    });
  };

  const syncContacts = () => {
    setShowLoader(true);

    let url = `/v1/marketing_users/sync_contacts`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setShowSuccessMsg(true);
        setSuccessMsg('Contact Synchronization Started');
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const handleUserPopup = () => {
    setShowCreateContactListPopup(true);
  };

  const showCreateContact = () => {
    setShowCreateContactPopup(true);
  };
  const onChangeSearch = (e) => {
    setContactSearchText(e.target.value);
    if (e.target.value === '') {
      getContacts();
    }
  };
  const searchContact = () => {
    setShowLoaderTable(true);

    let url = `/v1/marketing_users?value=` + contactSearchText;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setContactData(res.results);
        setShowLoaderTable(false);
      } else {
        console.log(err);
        setShowLoaderTable(false);
      }
    });
  };
  const onEnterPress = (e) => {
    if (e.key === 'Enter') {
      searchContact();
    }
  };

  const deleteContact = (formData) => {
    console.log(formData, 'formData');
    let header = {
      Token: userInfo.token,
    };
    ApiService.del('/v1/marketing_users/' + formData._id, {}, header, (res, err) => {
      if (res !== null) {
        setShowLoaderTable(false);
        setContactSearchText('');
        setSuccessMsg('Contact Deleted successfully');
        setShowSuccessMsg(true);
        getContacts();
      } else {
        console.log(err);
        setShowLoaderTable(false);
      }
    });
  };

  const handleSync = ()=>{
    setShowDeletePopup(true);
  }
  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      {/* <Header /> */}
      <div className="container-fluid cont-padd base-container">
        <div className="d-flex justify-content-between containerBackground align-items-center">
          <h2 className="mb-0">Contact List</h2>
          <div>
            <button className={[styles.applyBtn, 'mr-3 btn-primary'].join(' ')} onClick={showCreateContact}>
              Create New Contact
            </button>

            <button className={[styles.applyBtn, 'btn-primary'].join(' ')} onClick={handleSync}>
              Sync Contacts
            </button>

            <button className={[styles.applyBtn, 'ml-3 btn-primary'].join(' ')} onClick={handleUserPopup}>
              Create New Contact List
            </button>
          </div>
        </div>
        {showCreateContactListPopup && (
          <ContactListPopup
            show={showCreateContactListPopup}
            hide={() => setShowCreateContactListPopup(false)}
            propsData={propsData}
            getContactLists={getContactLists}
            isNew={true}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
            // deleteContactList={(e) => deleteContactList(e)}
          />
        )}

        {showCreateContactPopup && (
          <CreateContactPopup
            show={showCreateContactPopup}
            hide={() => setShowCreateContactPopup(false)}
            propsData={userData}
            isNew={true}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
          />
        )}
        {showDeletePopup && (
          <CustomPopup
            show={showDeletePopup}
            onDelete={() => syncContacts()}
            headerTitle={'Sync Contacts'}
            bodyMessage={'Are you sure? Do you want to sync the contacts?'}
            onClose={() => setShowDeletePopup(false)}
          />
        )}
        <div className="containerBackground">
          <ContactLisTable data={contactListData} getContactLists={getContactLists} deleteContactList={deleteContactList} />
        </div>

        <div className="containerBackground">
          <div className={['col-md-4', 'p-0 mb-3'].join(' ')}>
            <h6 className={styles.third_titile}>Search:</h6>
            <div className={styles.searchContainer}>
              <input type="text" className={styles.searchBar} value={contactSearchText} onChange={(e) => onChangeSearch(e)} onKeyDown={onEnterPress} />
              <button className={[styles.applyBtn, 'ml-2'].join(' ')} disabled={contactSearchText.length < 3} onClick={searchContact}>
                Search
              </button>
            </div>
          </div>
          <ContactTable data={contactData} loading={showLoaderTable} onDelete={deleteContact} />
        </div>
      </div>
    </>
  );
};

export default Contacts;
