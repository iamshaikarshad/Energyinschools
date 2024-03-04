import axios from 'axios';
import shortid from 'shortid';
import { AbstractApiService } from './core';

export interface Hub {
  id: number;
  uid: string;
  name: string;
  type: string;
  sub_location_id: number;
  description: string;
  created_at: string;
}

class HubsAPIService extends AbstractApiService {
  async getWebHubs(): Promise<Array<Hub>> {
    try {
      const response = await axios.get('/hubs/');
      return response.data.filter((hub: Hub) => hub.type === 'browser');
    } catch (error) {
      throw new Error(JSON.stringify(error.response.data));
    }
  }

  async getHubFirmware(hubUid: string, serial: string): Promise<ArrayBuffer> {
    const microbit_version = ['9900', '9901'].includes(serial?.slice(0,4)) ? 'v1' : 'v2';
    try {
      const response = await axios.get('/hubs/microbit-firmware/', {
        params: hubUid !== '-1' ? { uid: hubUid } : { microbit_version },
        responseType: 'arraybuffer',
        headers: { Authorization: undefined }
      });
      return response.data;
    } catch (error) {
      throw new Error(JSON.stringify(error.response.data));
    }
  }
}

export default new HubsAPIService();
