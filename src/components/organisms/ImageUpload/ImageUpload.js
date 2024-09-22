// --- Import statements as belore

import { useState } from 'react';
// import EditIcon from '../assets/edit.svg';

const ImageUpload = (props) => {
  return (
    <div className="">
      <input type="file" onChange={props.handleChange} />
      {props.file && <img src={props.file} alt={props.name} style={{ width: 150 }} />}
    </div>
  );
};

export default ImageUpload;
