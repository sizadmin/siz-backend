import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import React, { useEffect, useState } from 'react';
import ApiService from '../../../utils/middleware/ApiService';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import styles from './index.module.css';
import { useSelector } from 'react-redux';
import ContactListPopup from './ContactListPopup';
import moment from 'moment';
import CustomPopup from '../../organisms/CustomPopup/customPopup';

const ContactLisTable = (props) => {
  // const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [propsData, setPropsData] = useState();
  const [deleteUserData, setDeleteUserData] = useState();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);

  const handleShowDetails = (user) => {
    setPropsData({
      // lender_id: user?.lender_info[0]?._id,
      // shopify_id: user?.lender_info[0]?.shopify_id,
      // phone_number_whatsapp: user?.lender_info[0]?.phone_number_whatsapp,
      // account_number: user?.lender_info[0]?.account_number,
      // iban_number: user?.lender_info[0]?.iban_number,
      // swift_code: user?.lender_info[0]?.swift_code,
      // account_name: user?.lender_info[0]?.account_name,
      ...user,
    });
    setShowCreateUserPopup(true);
  };

  const showDeletePopupFunc = (record) => {
    setShowDeletePopup(true);
    setDeleteUserData(record);
  };

  const onDeleteFunc = () => {
    props.deleteContactList(deleteUserData);
    setDeleteUserData();
    setShowDeletePopup(false);
  };
  return (
    <>
      {showCreateUserPopup && (
        <ContactListPopup
          show={showCreateUserPopup}
          hide={() => setShowCreateUserPopup(false)}
          propsData={propsData}
          isNew={false}
          getContactLists={props.getContactLists}
          // deleteContactList={(e) => {
          //   props.deleteContactList(e);
          //   setShowCreateUserPopup(false);
          // }}
        />
      )}
      {showDeletePopup && (
        <CustomPopup
          show={showDeletePopup}
          onDelete={() => onDeleteFunc()}
          headerTitle={'Delete Contact List'}
          bodyMessage={'Are you sure? Do you want to delete this contact list?'}
          onClose={() => setShowDeletePopup(false)}
        />
      )}
      <h6 className="mb-2">Showing {props?.data?.length} Records</h6>
      <Table>
        <Thead>
          <Tr style={{ background: '#d1d1d1' }}>
            <Th style={{ width: 40 }}>#</Th>
            <Th>Name</Th>
            <Th>Contacts</Th>
            <Th>Status</Th>
            <Th>Created On</Th>
            <Th>Updated On</Th>
            <Th style={{ width: 60, textAlign: 'center' }}>Edit</Th>
            <Th style={{ width: 60, textAlign: 'center' }}>Delete</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props?.data?.length === 0 ? (
            <Tr>
              <Td colSpan="10">
                <div className="w-100 text-center">No Contact List Found</div>
              </Td>
            </Tr>
          ) : (
            <>
              {props?.data?.length > 0 &&
                props?.data?.map((user, i) => (
                  <React.Fragment key={i}>
                    <Tr style={{ borderBottom: '1px solid #e7d9d9' }}>
                      <Td>{i + 1}</Td>
                      <Td style={{ whiteSpace: 'nowrap', fontSize: 'small' }}>{user.name ? user.name : '-'}</Td>
                      <Td style={{ fontSize: 'small' }}>{user.phone_number.length}</Td>
                      <Td style={{ fontSize: 'small' }}>{user.isActive === true ? 'Active ' : 'In-active'}</Td>
                      <Td style={{ fontSize: 'small' }}>{moment(user.createdAt).format('DD MMM YYYY hh:mm a')}</Td>
                      <Td style={{ fontSize: 'small' }}>{moment(user.updatedAt).format('DD MMM YYYY hh:mm a')}</Td>
                      <Td style={{ fontSize: 'small', textAlign: 'center' }}>
                        <i className="fa fa-pencil" aria-hidden="true" style={{ fontSize: 20 }} onClick={() => handleShowDetails(user)}></i>
                      </Td>
                      <Td style={{ fontSize: 'small', textAlign: 'center' }}>
                        <i className="fa fa-trash" aria-hidden="true" style={{ fontSize: 20 }} onClick={() => showDeletePopupFunc(user)}></i>
                      </Td>
                    </Tr>
                  </React.Fragment>
                ))}
            </>
          )}
        </Tbody>
      </Table>
    </>
  );
};

export { ContactLisTable };
