import React, { useState, useEffect } from "react";

import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";

import styles from "./index.module.css";
import Logo from "./../../../assets/imgs/LOGO.jpeg";
// import CHECKED from "./../../../assets/imgs/checked.png";
import Sample1 from "./../../../assets/imgs/sample1.avif";
import moment from "moment";
import ApiService from "../../../utils/middleware/ApiService";
import ActivityLoader from "../../atom/ActivityLoader/ActivityLoader";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
const productList = [
  {
    title: "Freya Dress",
    sizes: "S/M",
    color: "Black",
    bookingdays: "4 Days",
    startdate: new Date(),
    enddate: new Date(),
  },
];
const Pickup = (props) => {
  let history = useHistory();
  const [errorMessages, setErrorMessages] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [startDate, setStartDate] = useState(
    moment().format("YYYY-MM-DDTHH:mm:ss")
  );
  const [startTime, setStartTime] = useState(
    moment().format("YYYY-MM-DDTHH:mm:ss")
  );
  const [orderDetails, setOrderDetails] = useState({});
  const [startDateTimeErr, setStartDateTimeErr] = useState("");
  const { productId } = useParams() || null;
  const [timeSlot, setTimeSlot] = useState("");
  const [orderDetailsStatus, setorderDetailsStatus] = useState({});

  useEffect(() => {
    async function data() {
      setShowLoader(true);
      getOrderDetails();
      getOrderDetailsStatus();
      setShowLoader(false);
    }
    data();
  }, []);
  const startDatHandler = (date, e) => {
    setStartDate(date);
  };
  const getOrderDetails = () => {
    ApiService.get("/v1/order/" + productId, {}, {}, (res, err) => {
      if (res !== null) {
        // console.log(res, "res");
        setOrderDetails(res.data[0]);
      } else {
        console.log(err);
        setErrorMessages(true);
        setShowLoader(false);
      }
    });
  };

  const getOrderDetailsStatus = () => {
    ApiService.get("/v1/order-status/" + productId, {}, {}, (res, err) => {
      if (res !== null) {
        setorderDetailsStatus(res.data[0]);
        if (res.data[0]?.product_pickup_date !== "") {
          setStartDate(
            moment(res.data[0]?.product_pickup_date).format(
              "YYYY-MM-DDTHH:mm:ss"
            )
          );
          if (res.data[0]?.product_pickup_timeslot !== "") {
            setTimeSlot(res.data[0]?.product_pickup_timeslot);
          }
        }
      } else {
        console.log(err);
        setErrorMessages(true);
        setShowLoader(false);
      }
    });
  };

  const handleSchedule = () => {
    setShowLoader(true);
    let payload = {
      product_pickup_date: `${dayjs(startDate).format("YYYY-MM-DD")}`,
      product_delivery_date: orderDetailsStatus?.product_delivery_date || "",
      notes: "",
      orderID: productId,
      _id: orderDetailsStatus._id,
      product_delivery_timeslot: orderDetailsStatus?.product_delivery_timeslot || null,
      product_pickup_timeslot: timeSlot || null,
      product_pickup_date_from_renter :orderDetailsStatus?.product_pickup_date_from_renter || null, 
      product_pickup_timeslot_from_renter : orderDetailsStatus?.product_pickup_timeslot_from_renter || null,
    };
    
    ApiService.post(
      "/v1/order-status/" + productId,
      payload,
      null,
      (res, err) => {
        // console.log(res, "res");
        if (res !== null) {
          setShowLoader(false);
          if (window.confirm("Thank you! for scheduling the pickup.")) {
            let url = "https://siz.ae"; // pass your url here
            window.open(url, "_blank");
          }
        } else {
          console.log(err);
          // setErrorMessages({ message: err.error });
          setShowLoader(false);
        }
      }
    );
  };

  return (
    <>
      {showLoader && <ActivityLoader show={showLoader} />}
      <div className="container cont-padd">
        <div className="d-flex">
          <div className="w-100">
            {/* {console.log(orderDetailsStatus, "ppp")} */}
            {orderDetails === undefined ? (
              <span>No Order details found.</span>
            ) : (
              <div
                className={[
                  "d-flex w-100 flex-column p-3",
                  styles.block1Outer,
                ].join(" ")}
              >
                <div>
                  <img src={Logo} alt="logo" className={styles.logoStyle} />
                </div>
                <div className="d-flex align-items-center mt-3">
                  <div></div>
                  <div>
                    <span>Order {orderDetails.order_details?.name}</span>
                    <br />
                    <h2
                      style={{
                        color: "#333333",
                        fontSize: "1.5714285714em",
                        fontWeight: "normal",
                      }}
                    >
                      Hey{" "}
                      {orderDetails.lender_name}{" "}
                      {/* {orderDetails.order_details.shipping_address?.last_name}, */}
                    </h2>
                  </div>
                </div>
                <div className={styles.box1style}>
                  <h4>
                    We got new rental request on your listed item with us.
                  </h4>
                  <span>
                    Please help us by selecting your preferred pickup details.
                  </span>
                </div>

                <div className={styles.box1style}>
                  <h4>Order details</h4>
                  <div className="col-md-12 col-sm-12 d-flex">
                    <div className="col-md-6 col-sm-12">
                      <span className="bold-600">Item Name</span>
                      <br />
                      <span>
                        {orderDetails.order_details?.line_items[0]?.title}
                      </span>
                      <br /> <br />
                      <span className="bold-600">Item Rental Period</span>
                      <br />
                      <span>
                        {
                          orderDetails.order_details?.line_items[0]
                            ?.properties[0]?.value
                        }
                      </span>
                    </div>
                    <div className="col-md-6 col-sm-12">
                      <span className="bold-600">Order Details</span>
                      <br />
                      <span>
                        {
                          orderDetails.order_details?.line_items[0]
                            ?.variant_title
                        }
                      </span>
                      <br /> <br />
                    </div>
                  </div>
                </div>
                <div className={styles.box1style}>
                  <div className={styles.scheduleBlock}>
                    <h4 className="bold-500">Pickup Delivery Details</h4>
                    <h6>
                      <i>
                        {" "}
                        ** We would like to schedule pickup for the above item
                        before Rental start date. Please select your preferred
                        pickup details
                      </i>
                    </h6>
                    <div>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className={styles.dateTimePickerContainer}>
                          <span style={{ marginRight: 20 }}>
                            Select Pickup Date:
                          </span>
                          <DatePicker
                            label="Select Pickup Date *"
                            onChange={startDatHandler}
                            value={startDate !== "" && dayjs(startDate)}
                            minDate={orderDetails.order_date != null && dayjs(orderDetails.order_date)}
                            maxDate={orderDetails.rental_start_date != null && dayjs(orderDetails.rental_start_date)}
                          />
                        </div>
                        <div className={styles.timePickerContainer}>
                          <span style={{ marginRight: 20 }}>
                            Select Time Slot:
                          </span>{" "}
                          <select
                            className={styles.dropdownStyle}
                            defaultValue={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                          >
                            <option selected> Select Timeslot</option>
                            <option>9AM-12PM</option>
                            <option>12PM-3PM</option>
                            <option>3PM-6PM</option>
                            <option>6PM-9PM</option>
                          </select>
                        </div>
                        {startDateTimeErr !== "" && (
                          <span
                            style={{ textAlign: "left", width: "100%" }}
                            className={styles.errorStyle}
                          >
                            {startDateTimeErr !== "" && startDateTimeErr}
                          </span>
                        )}
                      </LocalizationProvider>
                    </div>
                    <h6 className="mt-3">
                      <i>
                        {" "}
                        ** Please send the Whatsapp location pin{" "}
                        <a
                          href="https://wa.me/971553674923?text=Please%20share%20your%20location%20for%20smooth%20delivery%20experience"
                          rel="noopener"
                          target="_blank"
                        >
                          here
                        </a>{" "}
                        so our driver can easily find your address.
                      </i>
                    </h6>

                    <button
                      className={styles.Savebutton}
                      onClick={() => handleSchedule()}
                    >
                      Schedule Pickup
                    </button>
                  </div>
                  {errorMessages && (
                    <span className="mt-2 pt-2" style={{ color: "red" }}>
                      <i>**Something went wrong Please try later.</i>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* <div className="" style={{ width: "70%" }}>
            <div className={styles.productListing}>
              <ul style={{ listStyleType: "none" }}>
                {productList.map((itm, i) => (
                  <li key={`${i}_item`} className={styles.productListing}>
                    <div
                      className="d-flex"
                      style={{ justifyContent: "space-between" }}
                    >
                      <div
                        className={[styles.prodctThumbnail, "col-md-3"].join(
                          " "
                        )}
                      >
                        <img
                          src={Sample1}
                          alt="sample "
                          style={{ position: "absolute" }}
                          className={styles.productImg}
                        />

                        <span className={styles.imgCount}>
                          <span className={styles.countOuter}>1</span>
                        </span>
                      </div>
                      <div className="col-md-6">
                        <span className="bold-600"> {itm.title}</span>
                        <br />
                        <span> {itm.sizes}</span>/<span> {itm.color}</span>/
                        <span> {itm.bookingdays}</span>
                        <br />
                        <span>
                          Date: {moment(itm.startdate).format("MMM DD, YYYY")}{" "}
                          to{" "}
                        </span>
                        <span>
                          {moment(itm.enddate).format("MMM DD, YYYY")}
                        </span>
                      </div>
                      <div className="bold-600 col-md-3"></div>
                    </div>
                  </li>
                ))}
              </ul>
              <hr style={{ width: "90%", display: "flex", margin: "auto" }} />
              {/* <div className={styles.pricingBlock}>
                <span className={styles.productListingText}>Subtotal</span>
                <span className="bold-600">AED299.00</span>
              </div>
              <div className={styles.pricingBlock}>
                <span>Shipping</span>
                <span className="bold-600">Free</span>
              </div>
              <hr style={{ width: "90%", display: "flex", margin: "auto" }} />
              <div className={styles.pricingBlock}>
                <span className="bold-500">Total</span>
                <span className={[styles.totalAmount, "bold-600"].join(" ")}>
                  AED299.00
                </span>
              </div>

              <div className={styles.scheduleBlock}>
                <h4 className="bold-500">Pickup Delivery Details</h4>
                <h6>
                  <i>
                    {" "}
                    ** We would like to schedule pickup for the above item
                    before Rental start date. Please select your preferred pickup
                    details
                  </i>
                </h6>
                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className={styles.dateTimePickerContainer}>
                      <span style={{ marginRight: 20 }}>
                        Select Pickup Date:
                      </span>
                      <DatePicker
                        label="Select Pickup Date *"
                        onChange={startDatHandler}
                        value={startDate !== "" && dayjs(startDate)}
                      />
                    </div>
                    <div className={styles.timePickerContainer}>
                      <span style={{ marginRight: 20 }}>Select Time Slots</span>{" "}
                      <select className={styles.dropdownStyle}>
                        <option> 9AM - 11AM </option>
                        <option> 11AM - 1PM</option>
                        <option> 1PM - 3PM</option>
                        <option> 3PM - 5PM</option>
                        <option> 5PM - 7PM</option>
                        <option> 7PM - 9PM</option>
                      </select>
                    </div>
                    {startDateTimeErr !== "" && (
                      <span
                        style={{ textAlign: "left", width: "100%" }}
                        className={styles.errorStyle}
                      >
                        {startDateTimeErr !== "" && startDateTimeErr}
                      </span>
                    )}
                  </LocalizationProvider>
                </div>
                <h6 className="mt-3">
                  <i>
                    {" "}
                    ** Please share your Whatsapp location on the same number
                    where you received the order details
                  </i>
                </h6>

                <button
                  className={styles.Savebutton}
                  onClick={() => handleSchedule()}
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Pickup;
