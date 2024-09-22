import React, { useEffect, useReducer, useState } from 'react';
import styles from './customNavBar.module.css';
import Navbar from 'react-bootstrap/Navbar';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import DownArrow from '../../../assets/imgs/down-arrow.svg';
import { resetUser } from '../../../utils/redux/actions';

const CustomNavbar = (props) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 767);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      {isSmallScreen ? (
        <></>
      ) : (
        <Navbar key="" expand="md" className={styles.navbarContainer}>
          <Container fluid>
            <Navbar.Brand href="#">
              {/* <h1 className={[styles.navBarTitle, 'text-center'].join(' ')}></h1> */}
              <img src={require('../../../assets/imgs/LOGO.jpeg')} className={styles.logo} alt="logo" />
            </Navbar.Brand>
            <div className={styles.imageContainer}>
              <div className="dropdown">
                <button className="btn dropdown-toggle dropdown" type="button" id="userDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span>
                    {userInfo?.loggedUser?.first_name} {userInfo?.loggedUser?.last_name}
                    <img src={DownArrow} style={{ height: 25 }} alt="downArrow" />
                  </span>
                </button>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                  <button className="dropdown-item" onClick={() => navigate.push('/profile')}>
                    Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      dispatch(resetUser());
                      navigate.push('/');
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </Navbar>
      )}
    </div>
  );
};
export default CustomNavbar;
