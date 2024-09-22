/* eslint-disable no-useless-escape */
const API_URL = process.env.REACT_APP_DOMAIN;
export const truncate_string = (baseString, length = 50) => {
  return baseString.substring(0, length);
};

export const textCopier = (part) => {
  navigator.clipboard.writeText(API_URL + "/" + part);
};

export const wordCounter = (baseString) => {
  return baseString.split(" ").length;
};

export const wordTruncater = (baseString, words) => {
  return baseString.split(" ").splice(0, words).join(" ");
};

export const getDaysSinceLastMeeting = (meetingDate) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  return Math.round(Math.abs((today - new Date(meetingDate)) / oneDay));
};

export const timeZoneMap = {
  EST: "America/New_York",
  CST: "America/Chicago",
  MST: "America/Denver",
  PST: "America/Los_Angeles",
};

export const angularRegx = /(\<.+\>)/g;
export const emailRegx =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const phoneNumberRegx =
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

export const handleIsRequiredError = () => {
  return (
    <span className={"requiredErrorMsgStyle"}>This field is required *</span>
  );
};

export const handleMaxLimitError = (maxLength) => {
  return (
    <span className={"requiredErrorMsgStyle"}>
      Maximum {maxLength} char will be allowed *
    </span>
  );
};
export const handleMinLimitError = (minLength) => {
  return (
    <span className={"requiredErrorMsgStyle"}>
      Minimum {minLength} char will be allowed *
    </span>
  );
};

export const handleCustomErrorMsg = (errorMsg) => {
  return <span className={"requiredErrorMsgStyle"}>{errorMsg}</span>;
};
