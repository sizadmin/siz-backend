import { createStore, compose, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunkMiddleware from "redux-thunk";

import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import rootReducer from "./reducers"; // the value from combineReducers

const persistConfig = {
  key: "root",
  storage: storage,
  blacklist: ["navigation"], //, "commonReducer"

  stateReconciler: autoMergeLevel2, // see "Merge Process" section for details.
};

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose


export const store = createStore(
  pReducer,
  composeEnhancers(compose(
    applyMiddleware(thunkMiddleware),
  ))
);
export const persistor = persistStore(store);
