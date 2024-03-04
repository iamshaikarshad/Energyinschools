import * as jspath from 'jspath';
import { RequestStatus, RequestType, SerialPacket } from './SerialPacket';
import axios from 'axios';
import logger from '../libs/logger';
import { receivedHelloPackage } from './Packet';
import { historyMsg } from './Debug';

const FilterType = {
  '0': 'city',
  '1': 'postcode'
};

export class RequestHandler {
  private readonly translations;
  private readonly hub_variables;

  constructor(hub_variables: {}) {
    this.translations = hub_variables['translations']['json']; // grab the translations part for easier access
    this.hub_variables = hub_variables;
  }

  /***
   * Handles all requests and forwards the calls onto the correct handler based on the request type.
   *
   * @param serialPacket Incoming serial packet (ALL REQUESTS)
   */
  public async handleRequest(
    serialPacket: SerialPacket
  ): Promise<SerialPacket> {
    // if HELLO packet
    if (serialPacket.request_type === RequestType.REQUEST_TYPE_HELLO) {
      receivedHelloPackage();
      return await this.handleHelloPacket(serialPacket);

      // if a REST request
    } else if (
      serialPacket.getReqRes() &
      (RequestType.REQUEST_TYPE_GET_REQUEST |
        RequestType.REQUEST_TYPE_POST_REQUEST)
    ) {
      return await this.handleRESTRequest(serialPacket);

      // if a CLOUD variable
    } else if (
      serialPacket.getReqRes() & RequestType.REQUEST_TYPE_CLOUD_VARIABLE
    ) {
      return await this.handleCloudVariable(serialPacket);

      // if a BROADCAST request
    } else if (serialPacket.getReqRes() & RequestType.REQUEST_TYPE_BROADCAST) {
      return await this.handleBroadcast(serialPacket);
    }

    // if any other request type was found, reject it as unrecognised
    return new Promise((resolve, reject) => {
      reject(`Unrecognised packet type (${serialPacket.getReqRes()})`);
    });
  }

  /***
   * Maps a micro:bit query string to a defined query string format and returns
   * it in a list.
   *
   * @param queryString The string to be mapped (comes from the micro:bit)
   * @param queryStringFormat The string format (comes from translations.json)
   */
  private mapQueryString(queryString: string, queryStringFormat: string) {
    let formatPieces = queryStringFormat.split('/').filter(x => x);
    let queryPieces = queryString.split('/').filter(x => x);
    let root = queryPieces[0];
    let regexp = new RegExp('%(.*)%'); // regex that will find all %strings%
    let out = [];

    out['service'] = root; // set the service we are using to the first element (e.g. carbon, share, etc.)
    queryPieces.shift(); // shift pieces over after getting root
    root = queryPieces[0]; // get first piece

    // loop through the pieces in the query format (split by /)
    for (let format of formatPieces) {
      let name = regexp.exec(format);
      let key = name[1];

      // if it is an optional attribute
      if (key[key.length - 1] == '?') {
        if (root == '') break;

        key = key.substr(0, key.length - 1); // remove the ? from the attribute name
      }
      out[key] = root; // set the key and value in the output list

      if (queryPieces.length == 0) {
        root = '';
        continue;
      }

      queryPieces.shift();
      root = queryPieces[0]; // set the root to the first element
    }
    return out;
  }

  private processRESTRequest(
    serialPacket: SerialPacket,
    responsePacket: SerialPacket,
    translation: any[],
    requestType: string
  ): Promise<SerialPacket> {
    try {
      // gets the format for the micro:bit query string
      let mbQueryString = translation[requestType]['microbitQueryString']; // get microbitQueryString from translation

      // maps the query string coming from the micro:bit to the translated format
      let queryStrMap = this.mapQueryString(serialPacket.get(0), mbQueryString);

      // gets the baseURL for the specified service
      let baseURL = translation[requestType]['baseURL'];

      // gets the endpoint json
      let endpoint = queryStrMap['endpoint']
        ? translation[requestType]['endpoint'][queryStrMap['endpoint']]
        : {};

      // gets the queryObject for the specified endpoint
      let queryObject = endpoint['queryObject'];
      // if there was no query object, set it to blank
      if (queryObject == null) queryObject = [];
      //console.log(queryObject);

      // regex for finding url parts (e.g. api_endpoint, etc)
      let urlPart;
      let regexp = new RegExp('%([^%]*)%', 'g'); //"(?=\\w*%)%*\\w+%*");
      let newURL = baseURL;

      // loop through the URL and replace any % surrounded url parts with their queryObject counterparts
      while ((urlPart = regexp.exec(baseURL)) !== null) {
        // grab the default parameter from the URL
        let sectionParts = urlPart[1].split('?=');

        if (sectionParts[0] in queryObject) {
          // if there is a queryObject part, replace it with the value
          newURL = newURL.replace(urlPart[0], queryObject[sectionParts[0]]);
        } else if (sectionParts.length > 1) {
          // if there is a default, set it to it
          newURL = newURL.replace(urlPart[0], sectionParts[1]);
        } else {
          // if none of the above, replace with nothing
          newURL = newURL.replace(urlPart[0], '');
        }
      }

      logger.debug(`Service: ${queryStrMap['service'].toUpperCase()}`);
      logger.debug('Query string map', queryStrMap);

      return this.translation(
        queryStrMap,
        newURL,
        endpoint,
        responsePacket,
        serialPacket,
        requestType
      );
    } catch (e) {
      logger.error(e);
      return new Promise((resolve, reject) => {
        reject('REST REQUEST ERROR');
      });
    }
  }

  /***
   * @param queryStrMap
   * @param url
   * @param endpoint
   * @param responsePacket
   * @param serialPacket
   * @param requestType
   */
  private translation(
    queryStrMap: any[],
    url: string,
    endpoint: any[],
    responsePacket: SerialPacket,
    serialPacket: SerialPacket,
    requestType: string
  ): Promise<SerialPacket> {
    return new Promise((resolve, reject) => {
      switch (queryStrMap['service']) {
        case 'energy':
          try {
            const {
              location_uid,
              period_type,
              periods_ago,
              type
            } = queryStrMap as any;

            const route = type === 'hst' ? 'total' : 'live';
            const params =
              type === 'hst'
                ? {
                    period_type: `${period_type}s`,
                    periods_ago,
                    unit: 'watt_hour'
                  }
                : {
                    unit: 'watt'
                  };

            axios
              .get(`${url}/${route}`, {
                params: {
                  ...params,
                  location_uid,
                  meter_type: 'ELECTRICITY'
                }
              })
              .then(success => {
                console.log(success);

                let data = String(
                  jspath.apply(endpoint['jspath'], success.data)[0]
                );

                responsePacket.append(data);
                resolve(responsePacket);
              })
              .catch(error => {
                console.log('ERROR' + error);
                reject('COULD NOT GET ENERGY USAGE');
                return;
              });
          } catch (e) {
            console.log(e);
            reject('COULD NOT GET ENERGY USAGE');
          }
          break;
        case 'weather':
          const { filter, country } = queryStrMap as any;
          const filter_type = FilterType[queryStrMap['filter_type']];

          axios
            .get(url, {
              params: {
                filter,
                country,
                filter_type
              }
            })
            .then(success => {
              let data = String(
                jspath.apply(endpoint['jspath'], success.data)[0]
              );

              responsePacket.append(data);
              resolve(responsePacket);
            })
            .catch(error => {
              console.log('ERROR' + error);
              reject('COULD NOT GET WEATHER');
              return;
            });
          break;
        case 'carbon':
          try {
            axios
              .get(`${url}`)
              .then(success => {
                let data =
                  queryStrMap['endpoint'] == 'genmix'
                    ? String(
                        jspath.apply(
                          endpoint['jspath'].replace(
                            '%unit%',
                            queryStrMap['unit']
                          ),
                          success.data
                        )[0]
                      )
                    : String(jspath.apply(endpoint['jspath'], success.data)[0]);
                responsePacket.append(data);
                resolve(responsePacket);
              })
              .catch(error => {
                reject('COULD NOT GET DATA');
              });
          } catch (e) {
            reject('COULD NOT GET DATA');
          }
          break;
        default:
          reject(`UNKNOWN SERVICE ${queryStrMap['service']}`);
      }
    });
  }

  /***
   * Handles REST requests and gathers the correct translations and data needed to process the REST request.
   *
   * @param serialPacket Incoming serial packet (REST REQUEST)
   */
  private handleRESTRequest(serialPacket: SerialPacket): Promise<SerialPacket> {
    logger.debug('Received REST packet');
    try {
      let responsePacket = new SerialPacket(
        serialPacket.getAppID(),
        serialPacket.getNamespaceID(),
        serialPacket.getUID()
      );
      let queryPieces = serialPacket
        .get(0)
        .split('/')
        .filter(x => x);
      let root = queryPieces[0];

      queryPieces.shift(); // shift pieces over after getting root

      // check if the endpoint is in the translations
      if (!(root in this.translations)) {
        //TODO: utilise promises more and reject the errors instead
        return new Promise((resolve, reject) => {
          reject(`INVALID SERVICE (${root})`);
        });
      }

      // get translation for endpoint
      let translation = this.translations[root];
      let requestType;

      // decode request type (GET or POST)
      if (serialPacket.getReqRes() & RequestType.REQUEST_TYPE_GET_REQUEST) {
        requestType = 'GET';
        responsePacket.request_type |= RequestType.REQUEST_TYPE_GET_REQUEST;
      } else if (
        serialPacket.getReqRes() & RequestType.REQUEST_TYPE_POST_REQUEST
      ) {
        requestType = 'POST';
        responsePacket.request_type |= RequestType.REQUEST_TYPE_POST_REQUEST;
      } else {
        return new Promise((resolve, reject) => {
          reject('INVALID REQUEST TYPE');
        });
      }

      return this.processRESTRequest(
        serialPacket,
        responsePacket,
        translation,
        requestType
      );
    } catch (e) {
      logger.error(e);
      return new Promise((resolve, reject) => {
        reject('REST PACKET ERROR');
      });
    }
  }

  /***
   * Currently unimplimented.
   * TODO: Implement cloud variables
   *
   * @param serialPacket Incoming serial packet (CLOUD VARIABLE)
   */
  private handleCloudVariable(
    serialPacket: SerialPacket
  ): Promise<SerialPacket> {
    return new Promise((resolve, reject) => {
      reject('CLOUD UNIMPLEMENTED');
    });
  }

  /***
   * Currently unimplimented.
   * TODO: Implement broadcast
   *
   * @param serialPacket Incoming serial packet (CLOUD VARIABLE)
   */
  private handleBroadcast(serialPacket: SerialPacket): Promise<SerialPacket> {
    return new Promise((resolve, reject) => {
      reject('BROADCAST UNIMPLEMENTED');
    });
  }

  /***
   * Handles the Hello packet that is sent from the bridging micro:bit upon initialised connection.
   * An "OK" response is returned.
   *
   * @param serialPacket Incoming serial packet (HELLO PACKET)
   */
  private handleHelloPacket(serialPacket: SerialPacket): Promise<SerialPacket> {
    return new Promise((resolve, reject) => {
      logger.debug(`Received HELLO PACKET`);
      logger.debug(
        `School_ID: ${serialPacket.get(1)} hub_id: ${serialPacket.get(2)}`
      );

      historyMsg('Received HELLO PACKET');
      historyMsg(
        `School_ID: ${serialPacket.get(1)} hub_id: ${serialPacket.get(2)}`
      );

      let responsePacket = new SerialPacket(
        serialPacket.getAppID(),
        serialPacket.getNamespaceID(),
        serialPacket.getUID()
      );

      // if the school ID is blank
      if (!serialPacket.get(1)) {
        reject('BAD SCHOOL ID');
        return;
      }

      // if the hub ID is blank
      if (!serialPacket.get(1)) {
        reject('BAD HUB ID');
        return;
      }

      // set hub variables pi_id and school_id to true
      this.hub_variables['credentials']['school_id'] = serialPacket.get(1);
      this.hub_variables['credentials']['pi_id'] = serialPacket.get(2);

      // set request type to hello and status to OK
      responsePacket.setRequestBit(RequestType.REQUEST_TYPE_HELLO);
      responsePacket.setRequestBit(RequestStatus.REQUEST_STATUS_OK);
      responsePacket.append(0); // append a 0 for OK

      resolve(responsePacket); // resolve the response packet to be sent to the bridge micro:bit
    });
  }
}
