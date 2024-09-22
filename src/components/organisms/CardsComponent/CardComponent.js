import React, { useState } from "react";

import styles from "./card.module.css";
//import downArrow from "./../../../assets/svgs/down_arrow.svg";
//import upArrow from "./../../../assets/svgs/up_arrow.svg";

const CardComponent = ({ data, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={[styles.filterBlock, "expand-collapse cursor"].join(" ")} onClick={handleToggle}>
      <div className="align-items-center expand-collapse-content justify-content-between pl-3 pr-3 row" >
        <h6>Summary</h6>
        {/* <div className="text-right cursor" >
          <img src={isExpanded ? downArrow : upArrow} alt="expandedIcon" />
        </div> */}
        {isExpanded && (
          <div
            style={{ justifyContent: "center" }}
            className={[
              styles.cardDiv,
              "col-md-12",
              "row",
              "d-flex",
              "p-3",
            ].join(" ")}
          >
            {/* start admin view  */}
            {userRole === "Admin" && (
              <>
                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalRentalFees}</h4>
                  <h8>Total Rental Price</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalExpenses}</h4>
                  <h8>Total Expenses</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalProfit}</h4>
                  <h8>Total Gross Profit</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalLendersShare}</h4>
                  <h8>Total Lender's Share</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>
                    {Number(
                      data.totalRentalFees -
                        data.totalExpenses -
                        data.totalLendersShare
                    ).toFixed(2)}
                  </h4>
                  <h8>Net Profit</h8>
                </div>
              </>
            )}

            {/* end admin view  */}
            {userRole !== "Admin" && (
              <>
                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalRentalFees}</h4>
                  <h8>Total Rental Price</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalExpenses}</h4>
                  <h8>Total Expenses</h8>
                </div>

                <div className={[styles.cardStyle, "col-md-2"].join(" ")}>
                  <h4>{data.totalLendersShare}</h4>
                  <h8>Total Lender's Share</h8>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardComponent;