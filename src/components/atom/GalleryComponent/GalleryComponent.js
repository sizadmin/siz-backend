import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
const GalleryComponent = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageArray, setSelectedImageArray] = useState([]);
  const [indexVal, setIndexVal] = useState(0);

  useEffect(() => {
    setIndexVal(0);
  }, [selectedImage]);
  const openFullScreen = (image) => {
    setSelectedImage(image);
    setSelectedImageArray(images);
  };

  const closeFullScreen = () => {
    setSelectedImage(null);
    setSelectedImageArray([]);
  };

  const setIndexNext = () => {
    let totalLength = images.length - 1;
    if (indexVal === totalLength) {
      setIndexVal(0);
    } else setIndexVal(indexVal + 1);
  };
  const setIndexPrev = () => {
    let totalLength = images.length - 1;
    if (indexVal === totalLength) {
      setIndexVal(0);
    } else setIndexVal(indexVal + 1);
  };

  return (
    <div>
      <div className={styles.imageContainer}>
        {/* {images[0].map((image, index) => ( */}
        <img
          src={
            images.length > 0
              ? images[0].src
              : "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
          }
          alt={`img_${+1}`}
          style={{ height: 80, width: 80 }}
          className="cursor"
          onClick={() => openFullScreen(images[0])}
        />
        {/* ))} */}
      </div>

      {selectedImage && (
        <div className={styles.fullscreenOverlay}>
          <div className={styles.fullscreenImageContainer}>
            <div
              className="d-flex justify-content-between"
              style={{ color: "white" }}
            >
              <div>
                <span onClick={() => setIndexPrev()} className="mr-3 cursor">
                  Previous
                </span>

                <span className="cursor" onClick={() => setIndexNext()}>
                  Next
                </span>
              </div>
              <span onClick={() => closeFullScreen()} className="cursor">
                Close
              </span>
            </div>
            {selectedImageArray.map((image, index) => (
              <img src={images[indexVal].src} alt={`img_${index + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
