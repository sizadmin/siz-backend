import React from "react";
import { Route, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setUser } from "../../utils/redux/actions";

const AdminStaffRoute = ({ component: Component, ...rest }) => {
    const isAdminOrStaff = rest?.user?.userInfo?.loggedUser?.role?.role_name === "Admin" || rest?.user?.userInfo?.loggedUser?.role?.role_name === "Staff" || false;
    return (
        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={(props) => (isAdminOrStaff ? <Component {...props} /> : <Redirect to="/kpiDashboard" />)} />
    );
};

export default connect((state) => ({ user: state.user }), {
    setUser,
})(withRouter(AdminStaffRoute));
