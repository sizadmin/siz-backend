export const setUser = (user) => {
  return { type: "SET_USER", payload: user };
};
export const resetUser = () => {
  return { type: "RESET_USER" };
};
export const setProfileImage = (profile_photo) => {
  return { type: "SET_PROFILE", payload: profile_photo };
};
