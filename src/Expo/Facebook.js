/** @format */

const Facebook = {
  initializeAsync: async () => null,
  logInWithReadPermissionsAsync: async () => ({ type: 'cancel' }),
  logOut: () => {},
  getCurrentFacebook: async () => null,
  canShow: async () => false,
  show: async () => ({ isCancelled: true }),
};

export default Facebook;
