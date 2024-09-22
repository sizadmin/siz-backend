import React, { useState } from 'react';
import styles from './Tabs.module.css'; // Import the CSS Module

const Tabs = (props) => {
  const [activeTab, setActiveTab] = useState(props.value);
  const onChangeTab = (e) => {
    setActiveTab(e);
    props.onClick(e);
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeaders}>
        <div className={`${styles.tabHeader} ${activeTab === 'text' ? styles.active : ''}`} onClick={() => onChangeTab('text')}>
          <i className="fa fa-align-left"></i> {/* Icon for text */}
          Text
        </div>
        <div className={`${styles.tabHeader} ${activeTab === 'image' ? styles.active : ''}`} onClick={() => onChangeTab('image')}>
          <i className="fa fa-image"></i> {/* Icon for image */}
          Image
        </div>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'text' && (
          <div className={styles.textTab}>
            <p>{props.children}</p>
          </div>
        )}
        {activeTab === 'image' && <> {props.children}</>}
      </div>
    </div>
  );
};

export default Tabs;
