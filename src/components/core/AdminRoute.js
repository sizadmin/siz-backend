import React from "react";
import { Route, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setUser } from "../../utils/redux/actions";

const AdminRoute = ({ component: Component, ...rest }) => {
  const isAdmin = rest?.user?.userInfo?.loggedUser?.role?.role_name === 'Admin' || false;
  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route
      {...rest}
      render={(props) =>
        isAdmin ? <Component {...props} /> : <Redirect to="/kpiDashboard" />
      }
    />
  );
};

export default connect((state) => ({ user: state.user }), {
  setUser,
})(withRouter(AdminRoute));
