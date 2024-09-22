import React, { useState, useEffect } from "react";

import styles from "./index.module.css";
import ApiService from "../../../utils/middleware/ApiService";

// import Header from "./../../organisms/Navbar";
import { useSelector } from "react-redux";
import ActivityLoader from "../../atom/ActivityLoader/ActivityLoader";
import { UsersTable } from "./UsersTable";
import UserPopup from "./UserPopup";
import Notification from "../../organisms/Notification/notification";

const LenderSignup = () => {
  const [getOrdersdata, setOrdersdata] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [propsData, setPropsData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: null,
    isActive: false,
    password: "",
    address: "",
    lender_info: null,
    lender_id: "",
    shopify_id: "",
    phone_number_whatsapp: "",
    username:'',
    lender_type:'',
    account_number:'',
    iban_number:'',
    swift_code:'',
    account_name:''

  });
  const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  // const [lenderName, setLenderName] = useState("");
  // const [renterName, setRenterName] = useState("");
  // const [renterLName, setRenterLName] = useState("");

  // const [lenderLName, setLenderLName] = useState("");
  // const [paymentStatus, setPaymentStatus] = useState(null);
  const [showCreateUserPopup, setshowCreateUserPopup] = useState(false);
  const [orderType, setOrderType] = useState(null);

  const [sortOrderByOrder, setSortOrderByOrder] = useState("-order_number");
  const { userInfo } = useSelector((state) => state.user);
  // const [userRole, setUserRole] = useState(
  //   userInfo?.loggedUser?.role?.role_name
  // );
  const [rolesData, setRolesData] = useState([]);
  const [permissionData, setPermissionData] = useState([]);

  const [lendersData, setLendersData] = useState([]);

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function data() {
      getUsers();
      ApiService.get("/v1/roles", {}, {}, (res, err) => {
        if (res !== null) {
          setRolesData(
            res.results.map((e) => {
              return { label: e.role_name, value: e._id };
            })
          );
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });

      ApiService.get("/v1/permission", {}, {}, (res, err) => {
        if (res !== null) {
          setPermissionData(
            res.results.map((e) => {
              return { label: e.name, value: e._id };
            })
          );
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });


      ApiService.get("/v1/lenders", {}, {}, (res, err) => {
        if (res !== null) {
          setLendersData(
            res.length > 0
              ? res[0].data.map((e) => {
                  return { label: e.name, value: e._id };
                })
              : []
          );
        } else {
          console.log(err);
          setShowLoader(false);
        }
      });
    }
    data();
  }, [sortOrderByOrder]);

  const deleteUser = (formData) => {
    ApiService.del("/v1/user/" + formData._id, {}, {}, (res, err) => {
      if (res !== null) {
        setShowLoader(false);
        setSuccessMsg("User Deleted successfully");
        setShowSuccessMsg(true);
        setshowCreateUserPopup(false);
        getUsers();
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  
  const getUsers = () => {
    setShowLoader(true);

    let url = `/v1/users?`;

    if (startDate !== null) url += `&start_date=${startDate}T00:00:00.000Z`;

    if (orderType !== "" && orderType !== null)
      url += `&order_type=${orderType}`;

    // if (sortOrderByOrder !== "") url += `&sortByOrder=${sortOrderByOrder}`;
    let header = {
      Token: userInfo.token,
    };

    ApiService.get(url, {}, header, (res, err) => {
      if (res !== null) {
        setOrdersdata(res.results);
        setShowLoader(false);
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };
  const updateSorting = async (e) => {
    setSortOrderByOrder(e);

    getUsers();
  };

  const handleUserPopup = () => {
    setshowCreateUserPopup(true);
  };

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && (
        <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />
      )}
      {/* <Header /> */}
      <div className="container-fluid cont-padd base-container">
        <div className={["d-flex justify-content-between", styles.containerBackground].join(" ")}>
          <h2 className="mb-0">User management</h2>
          <div style={{margin:5}}>
            <button className={[styles.applyBtn,"btn-primary"].join(" ")} onClick={handleUserPopup}>
              Create User
            </button>
          </div>
        </div>
        {showCreateUserPopup && (
          <UserPopup
            show={showCreateUserPopup}
            hide={() => setshowCreateUserPopup(false)}
            propsData={propsData}
            getUsers={getUsers}
            rolesData={rolesData}
            lendersData={lendersData}
            isNew={true}
            setSuccessMsg={setSuccessMsg}
            setShowSuccessMsg={setShowSuccessMsg}
            deleteUser={(e) => deleteUser(e)}
            permissionData={permissionData}
          />
        )}

        <div className={styles.containerBackground}>
          <UsersTable
            data={getOrdersdata}
            sortOrderByOrder={sortOrderByOrder}
            changeSort={(e) => updateSorting(e)}
            getUsers={getUsers}
            rolesData={rolesData}
            lendersData={lendersData}
            deleteUser={(e) => deleteUser(e)}
            permissionData={permissionData}
          />
        </div>
      </div>
    </>
  );
};

export default LenderSignup;
