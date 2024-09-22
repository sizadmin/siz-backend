import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetUser } from '../../utils/redux/actions';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const userPermissions = useSelector((state) => state.user.userInfo?.loggedUser?.permission) || [];
  const userRole = useSelector((state) => state.user?.userInfo?.loggedUser.role.role_name);
  const isSystemAdmin = userRole === 'Admin';
  const history = useHistory();
  const dispatch = useDispatch();

  const hasPermission = userPermissions.some((permission) => allowedRoles.includes(permission.name));

  if (isSystemAdmin || hasPermission) {
    return <Component {...rest} />;
  }

  dispatch(
    resetUser({})
  );
  return history.push('/');
  // return history.push('/unauthorized');
};

export default ProtectedRoute;
