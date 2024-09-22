import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import React, { useState } from 'react';
import ContactListPopup from './ContactListPopup';
import { Digital } from 'react-activity';
import CustomPopup from '../../organisms/CustomPopup/customPopup';
import CreateContactPopup from './CreateContactPopup';

const ContactTable = (props) => {
  const [propsData, setPropsData] = useState();
  const [deleteUserData, setDeleteUserData] = useState();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);

  const handleShowDetails = (user) => {
    setPropsData({
      ...user,
    });
    setShowCreateUserPopup(true);
  };
  const showDeletePopupFunc = (record) => {
    setShowDeletePopup(true);
    setDeleteUserData(record);
  };

  const onDeleteFunc = ()=>{
    props.onDelete(deleteUserData);
    setDeleteUserData();
    setShowDeletePopup(false);
  }

  return (
    <>
      {props.loading && <Digital size={50} color="#af1010" />}

      {showCreateUserPopup && (
        <CreateContactPopup
          show={showCreateUserPopup}
          hide={() => setShowCreateUserPopup(false)}
          propsData={propsData}
          isNew={false}
          // setSuccessMsg={setSuccessMsg}
          // setShowSuccessMsg={setShowSuccessMsg}
        />
      )}
      {!props.loading && (
        <>
          <h6 className="mb-2">Showing {props?.data?.length} Records</h6>
          <Table>
            <Thead>
              <Tr style={{ background: '#d1d1d1' }}>
                <Th style={{ width: 40 }}>#</Th>
                <Th>Name</Th>
                <Th>Contact Number</Th>
                <Th>Status</Th>
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
                          <Td style={{ whiteSpace: 'nowrap', fontSize: 'small' }}>{user.first_name || user.last_name ? user.first_name + ' ' + user.last_name : 'Unknown'}</Td>
                          <Td style={{ fontSize: 'small' }}>{user.phone_number || '-'}</Td>
                          <Td style={{ fontSize: 'small' }}>{user.whatsapp_messaging === true ? 'Active ' : 'In-active'}</Td>
                          <Td style={{ fontSize: 'small', textAlign: 'center' }}>
                            <i className="fa fa-pencil" aria-hidden="true" style={{ fontSize: 20 }} onClick={()=>handleShowDetails(user)}></i>
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
          {showDeletePopup && (
            <CustomPopup
              show={showDeletePopup}
              onDelete={() => onDeleteFunc()}
              headerTitle={'Delete User'}
              bodyMessage={'Are you sure? Do you want to delete this user?'}
              onClose={() => setShowDeletePopup(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export { ContactTable };
