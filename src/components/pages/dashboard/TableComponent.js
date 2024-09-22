import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import React, { useEffect, useState } from "react";
import ApiService from "../../../utils/middleware/ApiService";
import ModalPopup from "./modalPopup";
import ActivityLoader from "../../atom/ActivityLoader/ActivityLoader";
import moment from "moment";
import styles from "./index.module.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
const OrderTable = (props) => {
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [propsData, setPropsData] = useState();
  const [orderDetailsStatus, setorderDetailsStatus] = useState({});
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const { userInfo } = useSelector((state) => state.user);
  const [userRole, setUserRole] = useState(
    userInfo?.loggedUser?.role?.role_name
  );

  const handleShowDetails = (order) => {
    setPropsData({
      order_id: order.order_id,
      shopify_order_number: order.order_number,
      order: order,
    });
    setShowDetailsPopup(true);
  };

  const handleCheckboxChange = (orderid) => {
    ApiService.get("/v1/updateToLenderAboutPayment/" + orderid, {}, null);
  };

  const calculateDays = (start, end) => {
    let a = moment(start, "YYYY-MM-DD");
    let b = moment(end, "YYYY-MM-DD");
    //Difference in number of days
    let days = moment.duration(b.diff(a)).asDays();
    return isNaN(days) ? 1 : days;
  };

  const areTodaysDate = (date2) => {
    // const today = moment("2023-11-16"); // current date
    // const next3days = moment("2023-11-16T00:00:00").add(3, "days");
    const today = moment(); // current date
    const next3days = moment().add(3, "days");
    const checkDate = moment(date2);
    const isBetween = checkDate.isBetween(today, next3days);
    if (date2 === undefined) return;
    if (moment(today).isSame(date2, "day") === true) return "#74b074";
    else if (isBetween === true) return "#dfdf58";
  };

  const getOrderDetailsStatus = (productId) => {
    console.log("Get order id : ", productId);
    ApiService.get("/v1/order-status/" + productId, {}, {}, (res, err) => {
      // console.log(res);
      if (res !== null) {
        setorderDetailsStatus(res.data[0]);
        let payload = {
          orderID: res.data[0]?.orderID,
          return_picked_up: "true",
          product_pickup_date: res.data[0]?.product_pickup_date || "",
          product_delivery_date: res.data[0]?.product_delivery_date || "",
          notes: "",
          _id: res.data[0]?._id || "",
          product_pickup_timeslot: res.data[0]?.product_pickup_timeslot || null,
          product_delivery_timeslot:
            res.data[0]?.product_delivery_timeslot || null,
          product_pickup_date_from_renter:
            res.data[0]?.product_pickup_date_from_renter || null,
          product_pickup_timeslot_from_renter:
            res.data[0]?.product_pickup_timeslot_from_renter || null,
        };
        // console.log("Payload ", payload);
        ApiService.post("/v1/order-status/" + productId, payload, null);
        return res;
      } else {
        console.log(err);
      }
    });
  };
  const updateStatus = async (orderid) => {
    let payload = {
      orderID: orderid,
      return_picked_up: "true",
      product_pickup_date: orderDetailsStatus?.product_pickup_date || "",
      product_delivery_date: orderDetailsStatus?.product_delivery_date || "",
      notes: "",
      _id: orderDetailsStatus?._id || "",
      product_pickup_timeslot:
        orderDetailsStatus?.product_pickup_timeslot || null,
      product_delivery_timeslot:
        orderDetailsStatus?.product_delivery_timeslot || null,
      product_pickup_date_from_renter:
        orderDetailsStatus?.product_pickup_date_from_renter || null,
      product_pickup_timeslot_from_renter:
        orderDetailsStatus?.product_pickup_timeslot_from_renter || null,
    };
    // console.log("Payload ", payload);
    ApiService.post("/v1/order-status/" + orderid, payload, null);
  };

  const renderDeliveryDate = (order) => {
    if (order.order_status != null) {
      if (order.order_status.product_delivery_date != null) {
        const deliveryDate = moment(
          order?.order_status?.[0]?.product_delivery_date
        );
        const isToday = deliveryDate.isSame(moment(), "day");
        return (
          <span className={isToday ? "highlighted-date" : ""}>
            {deliveryDate.format("DD-MMM-YYYY")}
          </span>
        );
      } else if (order.rental_start_date != null) {
        const rentalStartDate = moment(order?.rental_start_date);
        const isToday = rentalStartDate.isSame(moment(), "day");
        return (
          <span className={isToday ? "highlighted-date" : ""}>
            {rentalStartDate.format("DD-MMM-YYYY")}
          </span>
        );
      } else {
        return "-";
      }
    }
  };
  const renderProductPickupDateFromRenter = (order) => {
    if (order.order_status != null) {
      if (order.order_status.product_pickup_date_from_renter != null) {
        return moment(
          order?.order_status?.[0]?.product_pickup_date_from_renter
        ).format("DD-MMM-YYYY");
      } else if (order.rental_end_date != null) {
        return moment(order?.rental_end_date).format("DD-MMM-YYYY");
      } else {
        return "-";
      }
    }
  };
  const highlightPickupColumn = (order) => {
    if (order.order_status != null) {
      if (order.order_status.product_pickup_date_from_renter != null) {
        return areTodaysDate(
          order?.order_status?.[0]?.product_pickup_date_from_renter
        );
      } else if (order.rental_end_date != null) {
        return areTodaysDate(order?.rental_end_date);
      }
    }
  };

  const renderStatus = (order) => {
    // return <div className={styles.Completed}></div>
  };

  return (
    <>
      {/* {showLoader && <ActivityLoader show={showLoader} />} */}

      {showDetailsPopup && (
        <ModalPopup
          show={showDetailsPopup}
          hide={() => setShowDetailsPopup(false)}
          propsData={propsData}
          getOrders={props.getOrders}
        />
      )}
      <h6 className="mb-2">Showing {props.data.length} Records</h6>
      <div style={{ overflow: "auto", width: "200%" }}>
        <Table >
          <Thead>
            <Tr style={{ background: "#af1010", color: "white" }}>
              <Th style={{ width: 40 }}>#</Th>
              <Th>Delivery To Renter</Th>
              <Th>Pickup From Renter</Th>
              <Th
                className="cursor"
                onClick={() =>
                  props.changeSort(
                    props.sortOrderByOrder === "-order_number"
                      ? "order_number"
                      : "-order_number"
                  )
                }
              >
                Order Number
                <br />
                {props.sortOrderByOrder === "-order_number" ? (
                  <i style={{ fontSize: 24 }} className="fa fa-sort-down"></i>
                ) : (
                  <i style={{ fontSize: 24 }} className="fa fa-sort-up"></i>
                )}
              </Th>
              <Th>Renter Details</Th>
              <Th>Renter Address</Th>
              <Th>Product Details</Th>
              <Th>Lender Details</Th>
              <Th>Lender Address</Th>
              <Th>Pickup From Lender</Th>
              <Th>Delivery To Lender</Th>

              <Th>Order Date</Th>
              <Th>Rent Duration</Th>
              <Th>Brand</Th>
              <Th>Item</Th>
              <Th>Size</Th>
              <Th>Color</Th>
              <Th>Order Type</Th>
              <Th>Date of Fitting</Th>
              <Th>Pick up by dry cleaner from renter</Th>
              <Th>Return date by dry cleaner to lender</Th>
              <Th>Return to Lender</Th>
              <Th>Rental Fee</Th>
              <Th>Expenses</Th>
              <Th>Profit</Th>
              <Th>Lender's share</Th>
              <Th>Payment status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.data.length === 0 ? (
              <>
                <Tr>
                  <Td colSpan="10">
                    <div className="w-100 text-center">No Orders Found</div>
                  </Td>
                </Tr>
              </>
            ) : (
              <>
                {props.data.length > 0 &&
                  props.data.map((order, i) => (
                    <React.Fragment key={i}>
                      <Tr
                        style={{
                          borderBottom: "1px solid #e7d9d9",
                          cursor: "pointer",
                        }}
                        onClick={() => handleShowDetails(order)}
                      >
                        <Td>
                          {i + 1}
                          <br />
                          {renderStatus(order)}
                        </Td>
                        <Td
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "small",
                            background: areTodaysDate(order?.rental_start_date),
                          }}
                        >
                          {
                            <>
                              <span>
                                {renderDeliveryDate(order)}
                                {/* {order?.order_status?.[0]
                                ?.product_delivery_date
                                ? moment(
                                    order?.order_status?.[0]
                                      ?.product_delivery_date
                                  ).format("DD-MMM-YYYY")
                                : order?.rental_start_date ? moment(order?.rental_start_date).format("DD-MMM-YYYY") : "-"
                                } */}
                              </span>
                              <br />
                              <span>
                                {
                                  order?.order_status?.[0]
                                    ?.product_delivery_timeslot
                                }
                              </span>
                            </>
                          }
                        </Td>
                        <Td
                          style={{
                            whiteSpace: "nowrap",
                            fontSize: "small",
                            background: highlightPickupColumn(order),
                          }}
                        >
                          {
                            <>
                              <span>
                                {renderProductPickupDateFromRenter(order)}
                                {/* {order?.order_status?.[0]
                                ?.product_pickup_date_from_renter
                                ? moment(
                                    order?.order_status?.[0]
                                      ?.product_pickup_date_from_renter
                                  ).format("DD-MMM-YYYY")
                                : moment(
                                  order?.rental_end_date).format("DD-MMM-YYYY")} */}
                              </span>
                              <br />
                              <span>
                                {
                                  order?.order_status?.[0]
                                    ?.product_pickup_timeslot_from_renter
                                }
                              </span>
                              <br />
                            </>
                          }
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          <a
                            href={order?.order_details?.order_status_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {order.order_number}
                          </a>
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {order.order_details?.customer?.first_name}{" "}
                          {order.order_details?.customer?.last_name}
                          <br />
                          {userRole === "Admin" && (
                            <i>{order?.order_details?.phone}</i>
                          )}
                        </Td>

                        <Td style={{ fontSize: "small" }}>
                          {order?.order_details?.customer?.default_address &&
                            order?.order_details?.customer?.default_address
                              .address1}{" "}
                          {order?.order_details?.customer?.default_address &&
                            order?.order_details?.customer?.default_address
                              .address2}{" "}
                          {order?.order_details?.customer?.default_address &&
                            order?.order_details?.customer?.default_address
                              .city}{" "}
                          {order?.order_details?.customer?.default_address &&
                            order?.order_details?.customer?.default_address
                              .country_name}{" "}
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {" "}
                          {order?.order_details?.line_items?.[0]?.name}
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {order?.lender_name} <br /> {order?.lender_phone_call}{" "}
                          <br /> {order?.lender_phone_whatsapp}
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {order?.lender_address}
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {order?.order_status?.length > 0 && (
                            <>
                              <span>
                                {order?.order_status?.[0]
                                  ?.product_pickup_date !== null
                                  ? moment(
                                      order?.order_status?.[0]
                                        ?.product_pickup_date
                                    ).format("DD-MMM-YYYY")
                                  : "-"}
                              </span>
                              <br />
                              <span>
                                {
                                  order?.order_status?.[0]
                                    ?.product_pickup_timeslot
                                }
                              </span>
                            </>
                          )}
                        </Td>
                        <Td style={{ fontSize: "small" }}>
                          {order?.order_status?.length > 0 && (
                            <>
                              <span>
                                {order?.order_status?.[0]
                                  ?.product_delivery_date_to_lender
                                  ? moment(
                                      order?.order_status?.[0]
                                        ?.product_delivery_date_to_lender
                                    ).format("MM/DD/YYYY")
                                  : "-"}
                              </span>
                              <br />
                              <span>
                                {
                                  order?.order_status?.[0]
                                    ?.product_delivery_timeslot_to_lender
                                }
                              </span>
                              <span>
                                <input
                                  type="checkbox"
                                  disabled={
                                    order?.order_status?.[0]
                                      ?.return_picked_up === "true"
                                      ? true
                                      : false
                                  }
                                  checked={
                                    order?.order_status?.[0]
                                      ?.return_picked_up === "true"
                                      ? true
                                      : false
                                  }
                                  onChange={async (e) => {
                                    handleCheckboxChange(order.order_id);
                                    getOrderDetailsStatus(order.order_id);
                                    //updateStatus(order.order_id);
                                    e.target.disabled = true;
                                    e.target.checked = true;
                                  }}
                                />
                                <label htmlFor="return_picked_up">
                                  Dry Cleaning Complete
                                </label>
                              </span>
                            </>
                          )}
                        </Td>
                        <Td>
                          <span>
                            {order?.order_date
                              ? moment(order?.order_date).format("DD-MMM-YYYY")
                              : "-"}
                          </span>
                        </Td>
                        <Td>
                          {calculateDays(
                            order?.rental_start_date,
                            order?.rental_end_date
                          )}
                        </Td>
                        <Td>
                          {order?.order_items !== undefined &&
                            order?.order_items[0]?.vendor}{" "}
                          {/* {order.order_details?.customer?.first_name}{" "}
                          {order.order_details?.customer?.last_name}
                          <br />
                          {userRole === "Admin" && (
                            <i>{order?.order_details?.phone}</i>
                          )} */}
                        </Td>

                        <Td>
                          {order?.order_items !== undefined &&
                            order?.order_items[0]?.title}
                        </Td>
                        <Td>
                          {order?.order_items !== undefined &&
                            order?.order_items[0]?.variant_title?.split("/")[0]}
                        </Td>
                        <Td>
                          {order?.order_items !== undefined &&
                            order?.order_items[0]?.variant_title?.split("/")[1]}
                        </Td>
                        <Td>{order?.order_type ? order?.order_type : "-"}</Td>
                        <Td>
                          {order?.fitting_date
                            ? moment(order?.fitting_date).format("DD-MMM-YYYY")
                            : "-"}
                        </Td>
                        <Td>
                          {order?.pickup_by_dry_cleaner_from_renter
                            ? moment(
                                order?.pickup_by_dry_cleaner_from_renter
                              ).format("DD-MMM-YYYY")
                            : "-"}
                        </Td>
                        <Td>
                          {order?.returned_to_lender_by_dry_cleaner
                            ? moment(
                                order?.returned_to_lender_by_dry_cleaner
                              ).format("DD-MMM-YYYY")
                            : "-"}
                        </Td>
                        <Td>
                          {order?.returned_to_lender
                            ? order?.returned_to_lender === true
                              ? "Yes"
                              : "No"
                            : "-"}
                        </Td>
                        <Td>{order?.rental_fees}</Td>
                        <Td>{order?.expenses}</Td>
                        <Td>{Number(order?.rental_fees -  order?.expenses -  order?.lenders_share).toFixed(2)}</Td>
                        <Td>{order?.lenders_share}</Td>
                        <Td>
                          {order?.payment_status === true ? "Paid" : "Un-paid"}
                        </Td>
                      </Tr>
                    </React.Fragment>
                  ))}
              </>
            )}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export { OrderTable };
