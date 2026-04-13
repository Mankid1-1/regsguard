import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.regsguard.mobile';

export const keychain = {
  async setToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('token', token, { service: SERVICE_NAME });
  },

  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    if (credentials) return credentials.password;
    return null;
  },

  async clearToken(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  },
};
