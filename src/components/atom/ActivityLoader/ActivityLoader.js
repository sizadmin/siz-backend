import React from 'react';
import { Modal } from 'react-bootstrap';
import { Digital } from 'react-activity';
import styles from './css/ActivityLoader.module.css';

const ActivityLoader = (props) => (
  <Modal id="activityModal" show={props.show} centered className={styles.modalContainer}>
    <Digital size={50} color="#af1010" />
  </Modal>
);

export default ActivityLoader;