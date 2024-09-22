import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import React, { useState } from 'react';
// import styles from './index.module.css';
// import { useSelector } from 'react-redux';
import WhatsappTemplatePopup from './WhatsappTemplatePopup';
import { useHistory } from 'react-router';
import moment from 'moment';

const WhatsappTemplateTable = (props) => {
  // const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [propsData, setPropsData] = useState();
  // const { userInfo } = useSelector((state) => state.user);

  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  let history = useHistory();

  const handleShowDetails = (user) => {
    setPropsData({
      ...user,
    });
    history.push('/edit-template/' + user._id);
  };

  return (
    <>
      {showCreateUserPopup && (
        <WhatsappTemplatePopup
          show={showCreateUserPopup}
          hide={() => setShowCreateUserPopup(false)}
          propsData={propsData}
          isNew={false}
          getCampaignLists={props.getCampaignLists}
          deleteCampaign={(e) => {
            props.deleteCampaign(e);
            setShowCreateUserPopup(false);
          }}
        />
      )}
      <h6 className="mb-2">Showing {props?.data?.length} Records</h6>
      <Table>
        <Thead>
          <Tr style={{ background: '#d1d1d1' }}>
            <Th style={{ width: 40 }}>#</Th>
            <Th>Template Name</Th>
            <Th>Status</Th>
            <Th>Created On</Th>
            <Th>Updated On</Th>
            <Th style={{ width: 60, textAlign: 'center' }}>Edit</Th>
            {/* <Th style={{ width: 60, textAlign: 'center' }}>Delete</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {props?.data?.length === 0 ? (
            <Tr>
              <Td colSpan="10">
                <div className="w-100 text-center">No Templates Found</div>
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

                      <Td style={{ fontSize: 'small' }}>{user.status ? user.status : '-'}</Td>
                      <Td style={{ fontSize: 'small' }}>{moment(user.createdAt).format('DD MMM YYYY hh:mm a')}</Td>
                      <Td style={{ fontSize: 'small' }}>{moment(user.updatedAt).format('DD MMM YYYY hh:mm a')}</Td>
                      <Td style={{ fontSize: 'small', textAlign: 'center' }}>
                        <i className="fa fa-pencil" aria-hidden="true" style={{ fontSize: 20 }} onClick={() => handleShowDetails(user)}></i>
                      </Td>
                      {/* <Td style={{ fontSize: 'small', textAlign: 'center' }}>
                            <i className="fa fa-trash" aria-hidden="true" style={{ fontSize: 20 }} onClick={() => showDeletePopupFunc(user)}></i>
                          </Td> */}
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

export { WhatsappTemplateTable };
