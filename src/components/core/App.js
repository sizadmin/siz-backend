import React, { Suspense, lazy } from 'react';
import './App.css';
import 'rsuite/dist/rsuite.min.css';
import 'react-activity/dist/library.css';
import 'react-toggle/style.css'; // for ES6 modules
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../../utils/redux/store';
import ForgetPassword from '../pages/authentication/forgetPassword';
import ResetPassword from '../pages/authentication/resetPassword';
import { Button } from 'react-bootstrap';
import ActivityLoader from '../atom/ActivityLoader/ActivityLoader';
import BaseLayout from '../organisms/baseLayout/baseLayout';
import Profile from '../pages/Profile/Profile';
import ProtectedRoute from './PrivateRoute';

global.navigate = null;

const Login = lazy(() => import('../pages/authentication/login'));
const Delivery = lazy(() => import('../pages/delivery'));
const Pickup = lazy(() => import('../pages/pickup'));
const ReturnPickup = lazy(() => import('../pages/returnpickup'));
const Dashboard = lazy(() => import('../pages/dashboard'));
const LenderSignup = lazy(() => import('../pages/lendersignup'));
const Contact = lazy(() => import('../pages/contacts'));
const Campaign = lazy(() => import('../pages/campaign'));
const WhatsappTemplatePage = lazy(() => import('../pages/WhatsappTemplate'));
const CreateTemplate = lazy(() => import('../pages/WhatsappTemplate/CreateTemplate'));

const NoMatchPage = () => {
  document.body.style.height = '100%';
  return <div className="noPageFound">Page Not found</div>;
};

const ServerError = () => {
  const history = useHistory();
  document.body.style.height = '100%';
  return (
    <div className="noPageFound">
      <div>
        <h1 className="mb-3"> Something went wrong </h1>
        <h6 className="text-center">Please try again or report an issue to support</h6>
        <br />
        <div className="text-center">
          <Button
            variant="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <Suspense fallback={<ActivityLoader show={true} />}>
              <Switch>
                {/* Routes without BaseLayout */}
                <Route exact path="/" component={Login} />
                <Route exact path="/forgetPassword" component={ForgetPassword} />
                <Route exact path="/resetpassword" component={ResetPassword} />
                <Route exact path="/create-template" component={CreateTemplate} allowedRoles={['Whatsapp Template Management']} />
                <Route exact path="/edit-template/:templateId" component={CreateTemplate} allowedRoles={['Whatsapp Template Management']} />
                <Route exact path="/returnpickup/:productId" component={ReturnPickup} />
                <Route exact path="/delivery/:productId" component={Delivery} />
                <Route exact path="/pickup/:productId" component={Pickup} />
                <Route exact path="/error" component={ServerError} />
             
                {/* BaseLayout routes */}
                <Route path="/">
                  <BaseLayout>
                    <Switch>
                      <ProtectedRoute exact path="/dashboard" component={Dashboard} allowedRoles={['Order Management']} />
                      <ProtectedRoute exact path="/users" component={LenderSignup} allowedRoles={['User Management']} />
                      <ProtectedRoute exact path="/contacts" component={Contact} allowedRoles={['Contact Management']} />
                      <ProtectedRoute exact path="/campaigns" component={Campaign} allowedRoles={['Campaign Management']} />
                      <ProtectedRoute exact path="/templates" component={WhatsappTemplatePage} allowedRoles={['Whatsapp Template Management']} />
                      <Route exact path="/profile" component={Profile} />
                      <Route component={NoMatchPage} />
                    </Switch>
                  </BaseLayout>
                </Route>
                {/* Catch-all for unmatched routes */}
              </Switch>
              
              {/* <Route path="/*" component={NoMatchPage} /> */}
            </Suspense>
          </Router>
        </PersistGate>
      </Provider>
    </div>
  );
};

export default App;
