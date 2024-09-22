import moment from 'moment';
import styles from './index.module.css';
import React from 'react';
const WhatsAppTemplatePreview = ({ template = {} }) => {
  let todaysDate = moment().format('DD MMM YYYY');
  let todaysTime = moment().format('HH:MM');

  return (
    <div className={styles.whatsappPreview}>
      <div className={styles.whatsappHeader}>
        <img src={require('../../../assets/imgs/LOGO.jpeg')} alt="Profile" className={styles.profileImage} />
        <div className={styles.profileInfo}>
          <h4 style={{ lineHeight: 1 }}>
            Sizters App <img src={require('../../../assets/imgs/verified.png')} alt='verified' className={styles.verifiedIcon} />
          </h4>
          <span className={styles.status}>Online</span>
        </div>
        <div className={styles.whatsappActions}>
          <span className='mt-2'>
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" height="20">
              <path d="M511.2 387l-23.25 100.8c-3.266 14.25-15.79 24.22-30.46 24.22C205.2 512 0 306.8 0 54.5c0-14.66 9.969-27.2 24.22-30.45l100.8-23.25C139.7-2.602 154.7 5.018 160.8 18.92l46.52 108.5c5.438 12.78 1.77 27.67-8.98 36.45L144.5 207.1c33.98 69.22 90.26 125.5 159.5 159.5l44.08-53.8c8.688-10.78 23.69-14.51 36.47-8.975l108.5 46.51C506.1 357.2 514.6 372.4 511.2 387z" />
            </svg>
          </span>
          <span>
          <img src={require('../../../assets/imgs/video.png')} alt='verified' className={styles.verifiedIcon} />
          </span>
        </div>
      </div>
      <div className={styles.whatsappMessage}>
        <div className={styles.messageDate}>{todaysDate}</div>
        <div className={styles.messageContent}>
          {template.headerImageUrl !== '' && <img src={template.headerImageUrl} alt="Header" className={styles.headerImage} />}
          {template.headerText !== '' && <p style={{ marginTop: 20, fontWeight: 800 }} dangerouslySetInnerHTML={{ __html: template.headerText }}></p>}

          <p style={{ marginTop: 10 }} dangerouslySetInnerHTML={{ __html: template.body }}></p>
          <div className={[styles.messageFooter, 'w-100 mb-3'].join(' ')}>
            {template.buttonEnabled && (
              <>
                {template.buttons.find((btn) => btn.action_type === 'marketingOptOut') && (
                  <p className="mt-1">
                    <i>{template.buttons.find((btn) => btn.action_type === 'marketingOptOut').footerText}</i>
                    <div className={[styles.messageTimestamp, 'mr-2'].join(' ')}>{todaysTime}</div>
                  </p>
                )}
                {template.buttons.map((btn, i) => {
                  return (
                    <React.Fragment key={`btn_${i}`}>
                      {btn.buttonType === 'callToAction' && (
                        <>
                          <button className={[styles.buttonPreview, 'w-100'].join(' ')}>{btn.text}</button>
                        </>
                      )}

                      {btn.buttonType === 'QUICK_REPLY' && (
                        <>
                          <button className={[styles.buttonPreview, 'w-100'].join(' ')}>{btn.text}</button>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhatsAppTemplatePreview;
