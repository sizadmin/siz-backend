import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, withRouter } from "react-router-dom";
import { setUser } from "../../utils/actions";
const PublicRoute = ({ component: Component, restricted, ...rest }) => {
  const isLoggedIn = rest?.user?.key;
  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn && restricted ? (
          <Redirect to="/kpiDashboard" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default connect((state) => ({ user: state.user }), {
  setUser,
})(withRouter(PublicRoute));
