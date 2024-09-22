import React, { useEffect, useState } from 'react';
import Toggle from 'react-toggle';
import WhatsAppTemplatePreview from './WhatsAppTemplatePreview';
import Styles from './index.module.css';
import closeIcon from './../../../assets/imgs/cross.png';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import ApiService from '../../../utils/middleware/ApiService';
import { useHistory, useParams } from 'react-router';
import ActivityLoader from '../../atom/ActivityLoader/ActivityLoader';
import Notification from '../../organisms/Notification/notification';
import phoneCodes from '../../../utils/helper/helperData';
import BodyFieldEditor from '../../organisms/TextEditor';
import styles from './style.module.css';
import HeaderEditor from '../../organisms/TextEditor/headerEditor';
// import ImageUpload from '../../organisms/ImageUpload/ImageUpload';
import Tabs from './Tabs';
import { FileUploader } from 'react-drag-drop-files';
const fileTypes = ['JPG', 'PNG'];

const WhatsAppTemplateCreator = (props) => {
  const [template, setTemplate] = useState({
    name: '',
    language: 'en',
    body: '',
    headerEnabled: false,
    headerImageUrl: '',
    buttonEnabled: false,
    buttons: [], // Add state to hold multiple buttons
    bodyVariables: [],
    headerVariables: [],
    headerText: '',
    category: 'MARKETING',
  });
  const { userInfo } = useSelector((state) => state.user);
  let history = useHistory();
  const { templateId } = useParams() || null;
  const [showLoader, setShowLoader] = useState(false);

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [SuccessMsg, setSuccessMsg] = useState('');
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isTemplateModified, setITemplateModified] = useState(false);

  const [activeTab, setActiveTab] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const maxLength = 45;
  const [file, setFile] = useState();
  const [filePreview, setFilePreview] = useState();

  const handleChange = (e) => {
    setShowLoader(true);
    let header = {
      Token: userInfo.token,
    };

    setFile(e);
    setFilePreview(URL.createObjectURL(e));
    const formData = new FormData();
    formData.append('file', e);

    ApiService.post('/v1/template/uploadImage', formData, header, (res, err) => {
      if (res !== null) {
        setTemplate((prevTemplate) => ({
          ...prevTemplate,
          headerImageUrl: res.data.fileUrl,
          imageMediaCode: res.data.h,
        }));
        setTimeout(() => {
          setShowLoader(false);
          // history.push('/templates');
        }, 3000);
      } else {
        setShowLoader(false);
        setErrorMsg(err.message);
        setShowErrorMsg(true);

        setTimeout(() => {
          setErrorMsg('');
          setShowErrorMsg(false);
        }, 3000);
      }
    });
  };

  useEffect(() => {
    if (props.template) {
      let { template } = props;
      console.log(template,"template")
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        name: template.name,
        language: template.language,
        body: template.body,
        headerEnabled: template.headerImageUrl !== '' ? true : false,
        headerImageUrl: template.headerImageUrl,
        buttonEnabled: template.buttons.length > 0 ? true : false,
        buttons: template.buttons,
        bodyVariables: template.bodyVariables ?? [],
        headerVariables: template.headerVariables ?? [],
        headerText: template.headerText,
        ...template,
      }));
    }
  }, [props]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let fieldValue = props?.originalData?.[name];
    let templateValue = template?.[name];
    console.log(fieldValue, '-----', templateValue);
    if (fieldValue !== templateValue) setITemplateModified(true);

    // setTemplate({ ...template, [name]: value });
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      [name]: value,
    }));
  };

  const handleTemplateNameChange = (e) => {
    const { name, value } = e.target;
    setTemplate({ ...template, [name]: value?.toLowerCase() });
  };
  const handleInputChangeVariables = (e, i) => {
    const { name, value } = e.target;

    let updatedVariables = [...template.bodyVariables];
    updatedVariables[i] = { ...updatedVariables[i], [name]: value };

    setTemplate({ ...template, bodyVariables: updatedVariables });
    setITemplateModified(true);
  };
  const handleInputChangeVariablesHeader = (e, i) => {
    const { name, value } = e.target;

    let updatedVariables = [...template.headerVariables];
    updatedVariables[i] = { ...updatedVariables[i], [name]: value };

    setTemplate({ ...template, headerVariables: updatedVariables });
    setITemplateModified(true);
  };

  const handleToggleChange = (name) => {
    setTemplate({ ...template, [name]: !template[name] });
    setITemplateModified(true);
  };

  const handleButtonTypeChange = (index, e) => {
    const { name, value } = e.target;
    const updatedButtons = [...template.buttons];

    if (value === 'QUICK_REPLY') {
      updatedButtons[index] = { action_type: 'custom', text: '', buttonType: value };
    } else {
      updatedButtons[index] = { type: 'URL', text: '', url: '', ...updatedButtons[index], action_type: 'link' };
    }
    updatedButtons[index] = { ...updatedButtons[index], [name]: value, buttonType: value };
    setTemplate({ ...template, buttons: updatedButtons });
    setITemplateModified(true);
  };

  const handleCallToActionTypeChange = (index, e) => {
    const { name, value } = e.target;
    const updatedButtons = [...template.buttons];
    updatedButtons[index] = { ...updatedButtons[index], [name]: value, type: value === 'link' ? 'URL' : 'text' };
    if (value === 'link') {
      delete updatedButtons[index].phoneCode;
      delete updatedButtons[index].phoneNumber;
      delete updatedButtons[index].footerText;
    }
    if (value === 'callNumber') {
      delete updatedButtons[index].url;
    }
    setTemplate({ ...template, buttons: updatedButtons });
    setITemplateModified(true);
  };

  const handleOnChangeButtons = (index, e) => {
    const { name, value } = e.target;
    const updatedButtons = [...template.buttons];
    updatedButtons[index] = { ...updatedButtons[index], [name]: value };
    setTemplate({ ...template, buttons: updatedButtons });
    setITemplateModified(true);
  };

  const handleAddButton = () => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      buttons: [...prevTemplate.buttons, { action_type: 'custom', text: '', buttonType: 'QUICK_REPLY' }],
    }));
    setITemplateModified(true);
  };

  const handleRemoveButton = (index) => {
    const updatedButtons = template.buttons.filter((_, i) => i !== index);
    setTemplate({ ...template, buttons: updatedButtons });
    setITemplateModified(true);
  };

  const handleSubmit = () => {
    let header = {
      Token: userInfo.token,
    };
    const errors = {};
    console.log(template, 'payload');

    // Validate Template Name and Body
    if (!template.name.trim()) {
      errors.name = 'Template Name is required';
    }
    if (!template.body.trim()) {
      errors.body = 'Body Text is required';
    }

    // Validate "Variable Value if empty" fields
    template?.bodyVariables?.forEach((variable, index) => {
      if (!variable.value.trim()) {
        errors[`variableValue-${index}`] = 'This field cannot be empty';
      }
    });

    // If there are validation errors, update the state and do not proceed
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear previous errors if validation passes
    setValidationErrors({});

    // console.log(template, 'payload');
    setShowLoader(true);

    if (!templateId) {
      ApiService.post('/v1/template', template, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Template created successfully');
          setShowSuccessMsg(true);
          setTimeout(() => {
            setShowLoader(false);
            history.push('/templates');
          }, 3000);
        } else {
          setShowLoader(false);
          setErrorMsg(err.message);
          setShowErrorMsg(true);

          setTimeout(() => {
            setErrorMsg('');
            setShowErrorMsg(false);
          }, 3000);
        }
      });
    } else {
      template.status = template.status === 'APPROVED' || template.status === 'REJECTED' ? 'UPDATED' : template.status;
      ApiService.put('/v1/template/' + template._id, template, header, (res, err) => {
        if (res !== null) {
          setSuccessMsg('Template Updated successfully');
          setShowSuccessMsg(true);
          setTimeout(() => {
            setShowLoader(false);
            setITemplateModified(false);
            // history.push('/templates');
          }, 3000);
        } else {
          setShowLoader(false);
          setErrorMsg(err.message);
          setShowErrorMsg(true);

          setTimeout(() => {
            setErrorMsg('');
            setShowErrorMsg(false);
          }, 3000);
        }
      });
    }
  };

  const handleSubmitReview = () => {
    setShowLoader(true);
    let header = {
      Token: userInfo.token,
    };
    let payload = {
      _id: template._id,
    };

    ApiService.post('/v1/template/submitReview', payload, header, (res, err) => {
      if (res !== null) {
        setSuccessMsg('Template Submitted for review successfully');
        setShowSuccessMsg(true);
        setTimeout(() => {
          setShowLoader(false);
          history.push('/templates');
        }, 3000);
      } else {
        setShowLoader(false);
        setErrorMsg(err.message);
        setShowErrorMsg(true);

        setTimeout(() => {
          setErrorMsg('');
          setShowErrorMsg(false);
        }, 3000);
      }
    });
  };
  const handleCancel = () => {
    history.push('/templates');
  };

  const deleteTemplate = () => {
    setShowLoader(true);
    let header = {
      Token: userInfo.token,
    };
    ApiService.del('/v1/template/' + template._id, header, {}, (res, err) => {
      if (res !== null) {
        // setSuccessMsg('Template Deleted successfully');
        // setShowSuccessMsg(true);
        setTimeout(() => {
          setShowLoader(false);
          history.push('/templates');
        }, 3000);
        // getCampaignLists();
      } else {
        console.log(err);
        setShowLoader(false);
      }
    });
  };

  const addVariable = (text) => {
    if (text === 'add') {
      let variablesData = template.bodyVariables ?? [];

      variablesData.push({ label: variablesData.length + 1, value: '', field: 'first_name' });

      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        bodyVariables: variablesData,
      }));
    }
  };
  const addHeaderVariable = (text) => {
    if (text === 'add') {
      let variablesData = template.headerVariables ?? [];

      variablesData.push({ label: variablesData.length + 1, value: '', field: 'first_name' });

      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        headerVariables: variablesData,
      }));
    }
  };

  const removeHeaderVariable = (text) => {
    let variablesData = template.headerVariables;
    let cleanedText = text.replace(/{{|}}/g, '');

    // Filter out the item that matches the label
    let x = variablesData.filter((itm) => itm.label.toString() !== cleanedText);

    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      headerVariables: x,
    }));
    // }
  };

  const removeVariable = (text) => {
    let variablesData = template.bodyVariables;
    let cleanedText = text.replace(/{{|}}/g, '');

    // Filter out the item that matches the label
    let x = variablesData.filter((itm) => itm.label.toString() !== cleanedText);

    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      bodyVariables: x,
    }));
    // }
  };

  const navigateTo = () => {
    history.goBack();
  };

  const removeImg = () => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      headerImageUrl: '',
    }));
  };

  return (
    <div className="d-flex justify-content-around row">
      {showLoader && <ActivityLoader show={showLoader} />}
      {showSuccessMsg && <Notification show={showSuccessMsg} msg={SuccessMsg} type="success" />}
      {showErrorMsg && <Notification show={showErrorMsg} msg={ErrorMsg} type="error" />}

      <div className="d-flex justify-content-between align-items-center p-3 w-100 mb-5" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) -4px 9px 25px -6px', background: '#fff' }}>
        <div className="d-flex align-items-center">
          <div onClick={() => navigateTo()} className="cursor">
            <i className="fa fa-arrow-left fa-2x"></i>
          </div>
          <h4 className="ml-2">{template?.name !== '' ? template?.name : 'template_name'}</h4>
        </div>
        {(template.status === 'CREATED' || template.status === 'UPDATED') && !isTemplateModified && (
          <div className="row d-flex justify-content-center align-items-center mt-1">
            <span className="alert alert-success mb-0">Your template has not been submitted for approval by Meta. Please submit it to use the template.</span>
          </div>
        )}
        <div>
          {console.log(isTemplateModified, 'isTemplateModified')}
          {(template.status === 'CREATED' || template.status === 'UPDATED') && !isTemplateModified ? (
            <Button  className="btn-primary mr-4 " onClick={handleSubmitReview}>
              Submit for review
            </Button>
          ) : (
            <Button  className="btn-primary mr-4 " onClick={handleSubmit}>
              Save
            </Button>
          )}
          <Button  className="btn-primary mr-4" onClick={deleteTemplate}>
            Delete Template
          </Button>
          <Button variant="secondary" className="mr-2" onClick={handleCancel}>
            Discard
          </Button>
        </div>
      </div>
      <div className="d-flex justify-content-around row col-md-12">
        <div className={[Styles.templateCreator, 'col-md-4'].join(' ')} style={{ maxHeight: 730, overflowY: 'auto' }}>
          <div className="form-container">
            <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
              <label>Name:</label>
              <div className="d-flex flex-column p-0 w-100 mt-2">
                <input type="text" name="name" value={template.name} onChange={handleTemplateNameChange} disabled={templateId} className={Styles.inputField} />
                {validationErrors.name && <span className={Styles.errorMessage}>{validationErrors.name}</span>}
              </div>
            </div>

            <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
              <label>Category:</label>
              <select name="category" value={template.category} onChange={handleInputChange} disabled={templateId} className={[Styles.selectField, 'w-100 mt-2'].join(' ')}>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
              </select>
            </div>

            <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
              <label>Language:</label>
              <select name="language" value={template.language} onChange={handleInputChange} disabled={templateId} className={[Styles.selectField, 'w-100 mt-2'].join(' ')}>
                <option value="en">English</option>
                <option value="en_US">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                {/* Add more languages as needed */}
              </select>
            </div>

            <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
              <label>Header:</label>
              <div className={[Styles.inputField, 'd-flex flex-column p-0 w-100 mt-2'].join(' ')}>
                <Tabs onClick={setActiveTab} value={activeTab}>
                  {activeTab === 'text' && (
                    <>
                      <HeaderEditor
                        text={template.headerText ?? ''}
                        className={Styles.textareaField}
                        onChange={handleInputChange}
                        addHeaderVariable={addHeaderVariable}
                        variables={template.headerVariables}
                        removeHeaderVariable={removeHeaderVariable}
                        maxCharacters={45}
                        name={template.name}
                      />
                      {validationErrors.body && <span className={Styles.errorMessage}>{validationErrors.body}</span>}
                    </>
                  )}
                  {activeTab === 'image' && (
                    <div className={[Styles.formGroup, 'justify-content-center'].join(' ')}>
                      {template.headerImageUrl === '' ? (
                        <FileUploader
                          label="Upload or drop a file right here"
                          multiple={false}
                          className={styles.uploaderContainer}
                          handleChange={handleChange}
                          name="image"
                          types={fileTypes}
                        />
                      ) : (
                        <div className={styles.whatsappContainer}>
                          <img src={template.headerImageUrl} alt="imageLogo" style={{ height: 100 }} />
                          <span className={styles.clearIcon} onClick={removeImg}>
                            ✖
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Tabs>
              </div>
            </div>
            {activeTab !== 'image' && (
              <>
                {template?.headerVariables.length > 0 && (
                  <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
                    <label>Variables:</label>
                    <div>
                      {template?.headerVariables?.map((itm, i) => {
                        return (
                          <div key={i} className="d-flex">
                            <input
                              type="text"
                              name="label"
                              placeholder="Variable Name"
                              disabled
                              value={itm.label}
                              onChange={(e) => handleInputChangeVariablesHeader(e, i)}
                              className="inputField variables-input-width mr-3"
                            />
                            <div className="d-flex flex-column">
                              <input
                                type="text"
                                name="value"
                                value={itm.value}
                                placeholder="Variable Value if empty"
                                onChange={(e) => handleInputChangeVariablesHeader(e, i)}
                                className={`inputField variables-input-width mr-3 ${validationErrors[`variableValue-${i}`] ? 'error-field' : ''}`}
                              />
                              <span className={Styles.errorMessage}>
                                <i>Variable Value if empty</i>
                              </span>
                              {validationErrors[`variableValue-${i}`] && (
                                <span className={[Styles.errorMessage, Styles.variablesInputWidth].join(' ')}>{validationErrors[`variableValue-${i}`]}</span>
                              )}
                            </div>
                            <select
                              name="field"
                              value={itm.field}
                              onChange={(e) => handleInputChangeVariablesHeader(e, i)}
                              className={[Styles.selectField, Styles.variablesInputWidth].join(' ')}
                            >
                              <option value="first_name">FIRSTNAME</option>
                              <option value="last_name">LASTNAME</option>
                              <option value="PHONENUMBER">PHONENUMBER</option>
                              <option value="EMAIL">EMAIL</option>
                              <option value="TEXT">TEXT</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
              <label>Body Text:</label>
              <div className={[Styles.inputField, 'd-flex flex-column p-0 w-100 mt-2'].join(' ')}>
                <BodyFieldEditor
                  text={template.body}
                  className={Styles.textareaField}
                  onChange={handleInputChange}
                  addVariable={addVariable}
                  variables={template.bodyVariables}
                  removeVariable={removeVariable}
                  name="body"
                />
                {validationErrors.body && <span className={Styles.errorMessage}>{validationErrors.body}</span>}
              </div>
            </div>
            {template?.bodyVariables.length > 0 && (
              <div className={[Styles.formGroup, 'd-flex flex-column'].join(' ')}>
                <label>Variables:</label>
                <div>
                  {template?.bodyVariables?.map((itm, i) => {
                    return (
                      <div key={i} className="d-flex">
                        <input
                          type="text"
                          name="label"
                          placeholder="Variable Name"
                          disabled
                          value={itm.label}
                          onChange={(e) => handleInputChangeVariables(e, i)}
                          className={[Styles.inputField, Styles.variablesInputWidth, 'mr-3'].join(' ')}
                        />
                        <div className="d-flex flex-column">
                          <input
                            type="text"
                            name="value"
                            value={itm.value}
                            placeholder="Variable Value if empty"
                            onChange={(e) => handleInputChangeVariables(e, i)}
                            className={`${Styles.inputField} ${Styles.variablesInputWidth} mr-3 ${validationErrors[`variableValue-${i}`] ? 'error-field' : ''}`}
                          />
                          <span className={Styles.errorMessage}>
                            <i>Variable Value if empty</i>
                          </span>
                          {validationErrors[`variableValue-${i}`] && (
                            <span className={[Styles.errorMessage, Styles.variablesInputWidth].join(' ')}>{validationErrors[`variableValue-${i}`]}</span>
                          )}
                        </div>
                        <select
                          name="field"
                          value={itm.field}
                          onChange={(e) => handleInputChangeVariables(e, i)}
                          className={[Styles.selectField, Styles.variablesInputWidth].join(' ')}
                        >
                          <option value="first_name">FIRSTNAME</option>
                          <option value="last_name">LASTNAME</option>
                          <option value="PHONENUMBER">PHONENUMBER</option>
                          <option value="EMAIL">EMAIL</option>
                          <option value="TEXT">TEXT</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className={Styles.formGroup}>
              <label>Enable Button:</label>
              <Toggle checked={template.buttonEnabled} onChange={() => handleToggleChange('buttonEnabled')} className={Styles.toggleSwitch} />
            </div>
            {template.buttonEnabled === true && (
              <Button type="button" variant="secondary" onClick={handleAddButton} className={Styles.addButton}>
                Add Button
              </Button>
            )}
            {template.buttonEnabled && (
              <>
                {/* Render buttons if buttonType is 'URL' */}
                <div className={[Styles.formGroup, 'row'].join(' ')}>
                  {template.buttons.map((button, index) => (
                    <React.Fragment key={index}>
                      {button.buttonType === 'callToAction' && (
                        <div className={['button-group w-100', styles.buttonContainer].join(' ')}>
                          <button
                            onClick={() => handleRemoveButton(index)}
                            type="button"
                            className="custom-close-button d-flex mb-1"
                            style={{ marginLeft: 'auto' }}
                            aria-label="Close"
                          >
                            <img src={closeIcon} alt="Close" className={Styles.closeIcon_template} />
                          </button>
                          <div className={Styles.formGroup}>
                            <label>Button Type:</label>
                            <select name="buttonType" value={button.buttonType} onChange={(e) => handleButtonTypeChange(index, e)} className={Styles.selectField}>
                              <option value="QUICK_REPLY">Quick Replies</option>
                              <option value="callToAction">Call to Actions</option>
                            </select>
                          </div>
                          <div className={Styles.formGroup}>
                            <label>Type of action:</label>
                            <select name="action_type" value={button.action_type} onChange={(e) => handleCallToActionTypeChange(index, e)} className={Styles.selectField}>
                              <option value="link">Link</option>
                              <option value="callNumber">Call Number</option>
                            </select>
                          </div>
                          {button.action_type === 'callNumber' && (
                            <>
                              <div className={Styles.formGroup}>
                                <label>Phone Code:</label>
                                <select name="phoneCode" value={button.phoneCode} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.selectField}>
                                  <option value="">Select a country code</option>
                                  {phoneCodes?.map((itm, i) => {
                                    return (
                                      <option key={i} value={itm.value}>
                                        {itm.label}
                                      </option>
                                    );
                                  })}
                                  {/* Add more country codes as needed */}
                                </select>
                              </div>
                              <div className={Styles.formGroup}>
                                <label htmlFor="phoneNumber">Phone Number:</label>
                                <input type="text" name="phoneNumber" value={button?.phoneNumber} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                              <div className={Styles.formGroup}>
                                <label>Button Text:</label>
                                <input type="text" name="text" value={button?.text} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                            </>
                          )}

                          {button.action_type === 'link' && (
                            <>
                              <div className={Styles.formGroup}>
                                <label>URL:</label>
                                <input type="text" name="url" value={button.url} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                              <div className={Styles.formGroup}>
                                <label>Button Text:</label>
                                <input type="text" name="text" value={button.text} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {button.buttonType === 'QUICK_REPLY' && (
                        <div key={index} className={[styles.buttonContainer, 'button-group w-100'].join(' ')}>
                          <button
                            onClick={() => handleRemoveButton(index)}
                            type="button"
                            className={[Styles.customCloseButton, 'd-flex mb-1'].join(' ')}
                            style={{ marginLeft: 'auto' }}
                            aria-label="Close"
                          >
                            <img src={closeIcon} alt="Close" className={Styles.closeIcon_template} />
                          </button>
                          <div className={Styles.formGroup}>
                            <label>Button Type:</label>
                            <select name="buttonType" value={button.buttonType} onChange={(e) => handleButtonTypeChange(index, e)} className={Styles.selectField}>
                              <option value="QUICK_REPLY">Quick Replies</option>
                              <option value="callToAction">Call to Actions</option>
                            </select>
                          </div>
                          <div className={Styles.formGroup}>
                            <label>Quick Reply Type:</label>
                            <select name="action_type" value={button.action_type} onChange={(e) => handleCallToActionTypeChange(index, e)} className={Styles.selectField}>
                              <option value="custom">Custom</option>
                              <option value="marketingOptOut">Marketing Opt-Out</option>
                            </select>
                          </div>

                          {button.action_type === 'marketingOptOut' && (
                            <>
                              <div className={Styles.formGroup}>
                                <label>Footer Text:</label>
                                <input type="text" name="footerText" value={button.footerText} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                              <div className={Styles.formGroup}>
                                <label>Button Text:</label>
                                <input type="text" name="text" value={button.text} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                              </div>
                            </>
                          )}

                          {button.action_type === 'custom' && (
                            <div className={Styles.formGroup}>
                              <label>Quick Reply Text:</label>
                              <input type="text" name="text" value={button.text} onChange={(e) => handleOnChangeButtons(index, e)} className={Styles.inputField} />
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="col-md-8 d-flex justify-content-center">
          <WhatsAppTemplatePreview template={template} />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplateCreator;
