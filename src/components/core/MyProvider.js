import MyContext from "./MyContext";
import React, { useReducer } from "react";
import userReducer from "../../redux/reducers/userReducer"
const initialState = {
  userInfo: {},
  loader: false,
  notification: {},
};
export const MyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer,initialState);

  return (
    <MyContext.Provider
      value={{
        notification: state.notification,
        loader: state.loader,
        userInfo: state.userInfo,
        updateUserData: (userObj) => {
          dispatch(userObj)
        },
        removeUserData: () => {
          this.setState({ userInfo: {} });
        },
        toggleLoader: (val) => {
          dispatch({loader: val });
        },
        clearNotification: (val) => {
          this.setState({ notification: val });
        },
        updateNotification: (val) => {
          this.setState({ notification: val });
        },
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
