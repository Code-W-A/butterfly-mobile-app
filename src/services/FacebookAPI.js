/** @format */

import { DeviceEventEmitter } from 'react-native';
import Constants from '@common/Constants';

const toast = (message, duration = 4000) => {
  DeviceEventEmitter.emit(Constants.EmitCode.Toast, message, duration);
};

class FacebookAPI {
  async login() {
    toast('Facebook login is currently unavailable.');
    return null;
  }

  logout() {
    // No-op until a maintained Facebook SDK is integrated.
  }

  async getAccessToken() {
    return null;
  }

  async shareLink(link, desc) {
    if (link || desc) {
      // Keep signature and avoid unused-arg refactors in callers.
    }
    toast('Facebook sharing is currently unavailable.');
    return null;
  }
}

export default new FacebookAPI();
