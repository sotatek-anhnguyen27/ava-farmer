import axios from 'axios';
// eslint-disable-next-line max-len
export default class BaseRequest {
  getUrlPrefix () {
    return '/api';
  }

  async get (url: any, params = {}) {
    try {
      const config = {
        params
      };
      const response = await axios.get(this.getUrlPrefix() + url, config);
      return this._responseHandler(response);
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async put (url: any, data = {}) {
    try {
      const response = await axios.put(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async post (url: any, data = {}) {
    try {
      const response = await axios.post(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async patch (url: any, data = {}) {
    try {
      const response = await axios.patch(this.getUrlPrefix() + url, data);
      return this._responseHandler(response);
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async del (url: any, data = {}) {
    try {
      const response = await axios.delete(this.getUrlPrefix() + url, { data });
      return this._responseHandler(response);
    } catch (error) {
      return this._errorHandler(error);
    }
  }

  async _responseHandler (response: any) {
    return response.data;
  }
  async _errorHandler (err: any) {
    if (err.response) {
      console.log('===errorHandler', JSON.stringify(err.response));
      console.log('===errorHandler data', JSON.stringify(err.response.data));
      console.log('===errorHandler status', JSON.stringify(err.response.status));
      console.log('===errorHandler headers', JSON.stringify(err.response.headers));
    } else {
      console.log('==errorHandler', JSON.stringify(err));
    }
    if (err.response && err.response.status === 401) {
      // await store.dispatch('account/generateToken');
    }
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error);
    }
    if (err.response && err.response.data && err.response.data.message && err.response.data.message[0]) {
      throw new Error(err.response.data.message[0]);
    }
    throw err;
  }
}
