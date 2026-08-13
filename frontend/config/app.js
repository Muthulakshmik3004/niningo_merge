// All API endpoint

import config from "./config";

const API = {
  LOGIN: `${config.BASE_URL}/login`,
  REGISTER: `${config.BASE_URL}/register`,
  SEND_OTP: `${config.BASE_URL}/otp/send`,
  VERIFY_OTP: `${config.BASE_URL}/otp/verify`,
  PROFILE: `${config.BASE_URL}/profile`,
  LOGOUT: `${config.BASE_URL}/logout`,  
};

export default API;