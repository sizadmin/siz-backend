import React from 'react';
import styles from './baseLayout.module.css';
import SideNavbar from '../LeftSideBar';
import CustomNavbar from '../CustomNavBar/CustomNavBar';

const BaseLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      <SideNavbar />
      <div className="main-content">
        <CustomNavbar />
        <div className={styles.outlet}>
          {children} {/* Render nested routes here */}
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
