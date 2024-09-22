import React from 'react';
import { Modal } from 'react-bootstrap';
import closeIcon from './../../../assets/imgs/cross.png';

const CustomPopup = (props) => {
  return (
    <Modal show={props.show} dialogClassName="modal-90w" className="my-modal" id="DeletePopup">
      <Modal.Header>
        <Modal.Title className={['d-flex justify-content-between w-100 font-weight-bold'].join(' ')}>{props.headerTitle}</Modal.Title>
        <button type="button" className="custom-close-button" aria-label="Close" onClick={props.onClose}>
          <img src={closeIcon} alt="Close" className={'closeIcon'} />
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mt-2">
          <h5>{props.bodyMessage}</h5>
          <div className="d-flex justify-content-center mt-4 mb-3">
            <button className="btn btn-primary" onClick={props.onDelete}>
              Delete
            </button>
            <button className="btn btn-secondary ml-3" onClick={props.onClose}>
              Cancel
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CustomPopup;
