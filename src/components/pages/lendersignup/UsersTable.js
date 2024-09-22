import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import React, {  useState } from 'react';
// import ApiService from '../../../utils/middleware/ApiService';
// import ModalPopup from "./modalPopup";
// import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
// import moment from 'moment';
// import styles from './index.module.css';
// import dayjs from 'dayjs';
// import { useSelector } from 'react-redux';
import UserPopup from './UserPopup';
// import deleteIcon from './../../../assets/imgs/deleteIcon.jpeg';
const UsersTable = (props) => {
  // const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [propsData, setPropsData] = useState();
  // const [orderDetailsStatus, setorderDetailsStatus] = useState({});
  // const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  // const { userInfo } = useSelector((state) => state.user);

  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  // const [userRole, setUserRole] = useState(userInfo?.loggedUser?.role?.role_name);

  const handleShowDetails = (user) => {
    setPropsData({
      lender_id: user?.lender_info[0]?._id,
      shopify_id: user?.lender_info[0]?.shopify_id,
      phone_number_whatsapp: user?.lender_info[0]?.phone_number_whatsapp,
      account_number: user?.lender_info[0]?.account_number,
      iban_number: user?.lender_info[0]?.iban_number,
      swift_code: user?.lender_info[0]?.swift_code,
      account_name: user?.lender_info[0]?.account_name,
      ...user,
    });
    setShowCreateUserPopup(true);
  };

  return (
    <>
      {showCreateUserPopup && (
        <UserPopup
          show={showCreateUserPopup}
          hide={() => setShowCreateUserPopup(false)}
          propsData={propsData}
          getUsers={props.getUsers}
          rolesData={props.rolesData}
          lendersData={props.lendersData}
          permissionData={props.permissionData}
          isNew={false}
          deleteUser={(e) => {
            props.deleteUser(e);
            setShowCreateUserPopup(false);
          }}
        />
      )}
      <h6 className="mb-2">Showing {props.data.length} Records</h6>
      <Table className="w-100">
        <Thead>
          <Tr style={{ background: '#d1d1d1' }}>
            <Th style={{ width: 40 }}>#</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>Email</Th>
            <Th>Active</Th>
            <Th>Phone Number</Th>
            <Th>Role</Th>
            <Th style={{ width: 60, textAlign: 'center' }}>Edit</Th>
            {/* <Th style={{ width: 60, textAlign: 'center' }}>Delete</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {props.data.length === 0 ? (
            <>
              <Tr>
                <Td colSpan="10">
                  <div className="w-100 text-center">No Users Found</div>
                </Td>
              </Tr>
            </>
          ) : (
            <>
              {props.data.length > 0 &&
                props.data.map((user, i) => (
                  <React.Fragment key={i}>
                    <Tr className="cursor">
                      <Td>{i + 1}</Td>
                      <Td>{user.first_name ? user.first_name : '-'}</Td>
                      <Td>{user.last_name ? user.last_name : '-'}</Td>
                      <Td style={{ fontSize: 'small' }}>{user.email ? user.email : '-'}</Td>
                      <Td style={{ fontSize: 'small' }}>{user.isActive === true ? 'Active ' : 'In-active'}</Td>

                      <Td style={{ fontSize: 'small' }}>{user.phone_number ? user.phone_number : '-'}</Td>
                      <Td style={{ fontSize: 'small' }}>{Object.keys(user.role).length > 0 ? user.role.role_name : '-'}</Td>
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

export { UsersTable };
