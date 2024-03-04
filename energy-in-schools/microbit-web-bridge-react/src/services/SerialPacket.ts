import { Packet } from './Packet';
import * as bufferpack from 'bufferpack';
import logger from '../libs/logger';

export enum SubType {
  SUBTYPE_STRING = 0x01,
  SUBTYPE_INT = 0x02,
  SUBTYPE_FLOAT = 0x04,
  SUBTYPE_EVENT = 0x08
}

export enum RequestType {
  REQUEST_TYPE_GET_REQUEST = 0x01,
  REQUEST_TYPE_POST_REQUEST = 0x02,
  REQUEST_TYPE_CLOUD_VARIABLE = 0x04,
  REQUEST_TYPE_BROADCAST = 0x08,
  REQUEST_TYPE_HELLO = 0x10
}

export enum RequestStatus {
  REQUEST_STATUS_ACK = 0x20,
  REQUEST_STATUS_ERROR = 0x40,
  REQUEST_STATUS_OK = 0x80
}

export enum SlipChar {
  SLIP_END = 0xc0,
  SLIP_ESC = 0xdb,
  SLIP_ESC_END = 0xdc,
  SLIP_ESC_ESC = 0xdd
}

export const HEADER_LENGTH = 5;
export const HEADER_STRUCTURE = '<BBHB'; // used for packing and bufferpack.unpacking the header values (Little-endian Byte Byte Short Byte)

export class SerialPacket implements Packet {
  app_id: number;
  namespace_id: number;
  uid: number;
  request_type: number;
  payload: any[];

  /***
   * Creates a SerialPacket and initialises header and payload variables.
   *
   * @param app_id app_id from the micro:bit
   * @param namespace_id namespace_id from the micro:bit
   * @param uid uid from the micro:bit
   * @param request_type request_type from the micro:bit
   * @param payload Encoded prototype from the micro:bit
   */
  constructor(
    app_id: number,
    namespace_id: number,
    uid: number,
    request_type?: number,
    payload?: number[]
  ) {
    this.app_id = app_id;
    this.namespace_id = namespace_id;
    this.uid = uid;
    this.request_type = request_type;
    this.payload = [];

    // if the a payload was passed in, decode it
    if (payload != null) {
      this.decode(payload);
    }
  }

  /***
   * Returns the app_id of the packet.
   */
  public getAppID(): number {
    return this.app_id;
  }

  /***
   * Returns the namespace_id of the packet.
   */
  public getNamespaceID(): number {
    return this.namespace_id;
  }

  /***
   * Returns the UID of the packet.
   */
  public getUID(): number {
    return this.uid;
  }

  /***
   * Returns the request_type or'ed with the response_type.
   */
  public getReqRes(): number {
    return this.request_type;
  }

  /***
   * Returns the header in a byte array ready for sending to the micro:bit.
   */
  public getHeader(): number[] {
    return bufferpack.pack(HEADER_STRUCTURE, [
      this.app_id,
      this.namespace_id,
      this.uid,
      this.request_type
    ]);
  }

  /***
   * Returns the non-formatted payload in array form.
   */
  public getPayload(): any[] {
    return this.payload;
  }

  /***
   * Converts values found in the payload into an array of byte arrays ready for sending to the micro:bit.
   *
   * @returns The SerialPacket's payload in byte array form
   */
  public getFormattedPayloadParts(): number[] {
    let formattedPayload: any = [];

    /**
     * Checks if a value is an integer.
     *
     * @param n Value to check is an integer
     */
    function isInt(n) {
      return Number(n) === n && n % 1 === 0;
    }

    /**
     * Checks if a value is a float.
     *
     * @param n Value to check is a float
     */
    function isFloat(n) {
      return Number(n) === n && n % 1 !== 0;
    }

    // format the payload data correctly
    for (let i = 0; i < this.payload.length; i++) {
      let value: unknown = this.payload[i];

      switch (typeof value) {
        case 'number': // int or float
          if (isInt(value)) {
            formattedPayload.push(
              bufferpack.pack('<Bi', [SubType.SUBTYPE_INT, value])
            ); // pack integer into a byte array and append it to the formatted payload
          } else if (isFloat(value)) {
            formattedPayload.push(
              bufferpack.pack('<Bf', [SubType.SUBTYPE_FLOAT, value])
            ); // pack float into a byte array and append it to the formatted payload
          }
          break;

        case 'string': // string
          formattedPayload.push(
            bufferpack.pack(`<B${value.length + 1}s`, [
              SubType.SUBTYPE_STRING,
              value + '\0'
            ])
          ); // pack string into a byte array
          break;

        default:
          //TODO: Implement Events
          logger.warn(
            `FOUND UNIMPLEMENTED SUBTYPE WHILE ENCODING PACKET ${typeof value} (${value})`
          );
      }
    }
    return formattedPayload;
  }

  /***
   * Returns a formatted packet in byte array form.
   *
   * Byte  |   Use
   * -------------------------
   * 0 - 4 | app_id
   *       | namespace_id
   *       | uid
   *       | request_type
   *       |
   * 5 - n | payload contiguously stored
   * n + 1 | SLIP_END (192)
   */
  public getFormattedPacket(): number[] {
    let finalPacket = new Uint8Array(this.length()); // create new array to store all others
    finalPacket.set(this.getHeader()); // add header to new array

    let offset = this.getHeader().length; // set offset to the length of the header

    // loop through all parts of the payload, adding each element at the offset
    this.getFormattedPayloadParts().forEach(item => {
      // @ts-ignore
      finalPacket.set(item, offset);
      // @ts-ignore
      offset += item.length;
    });

    // WORKAROUND. TODO. Fill response packet with zeros for preventing data sent message in input package

    let messageArray = Array.from(finalPacket);

    let newLength = 63 - messageArray.length;

    messageArray = messageArray
      .concat(new Array(newLength).fill(0))
      .slice(0, 61); // first 2 bytes are reserved, last byte is for slip_end

    messageArray = messageArray.concat(SlipChar.SLIP_END);

    return messageArray; // condense into one non-typed array and append a SLIP_END character
  }

  /***
   * Calculates and returns the length total of the packet before any SLIP has been added.
   */
  public length(): number {
    let length = 0;
    length += this.getHeader().length;

    // loop through all payload parts
    this.getFormattedPayloadParts().forEach(item => {
      // @ts-ignore
      length += item.length;
    });

    return length;
  }

  /***
   * Sets a bit in the request_type header byte.
   * @param bitValue The bit to set
   */
  public setRequestBit(bitValue: number) {
    this.request_type |= bitValue;
  }

  /***
   * Clears a given bit in the request_type header byte.
   * @param bitValue The bit to clear
   */
  public clearRequestBit(bitValue: number) {
    this.request_type &= ~bitValue;
  }

  /***
   * Modifies the SerialPacket to return an error status by clearing any previously set status flags
   * while retaining the request type (e.g. REST, hello, etc.)
   */
  public clearAndError(errorMessage?: string): SerialPacket {
    // set status code to REQUEST_STATUS_ERROR
    this.setRequestBit(RequestStatus.REQUEST_STATUS_OK); //FIXME: The Python hub uses REQUEST_STATUS_OK to reply with an error
    //this.setRequestBit(RequestStatus.REQUEST_STATUS_ERROR); //FIXME: The Python hub uses REQUEST_STATUS_OK to reply with an error

    // clear payload and add an error message if necessary
    this.clear();

    // append ok for webhub
    this.append(0);

    return this;
  }

  /***
   * Appends a variable onto the end of the payload.
   *
   * @param variable The variable to add to the SerialPacket payload
   */
  public append(variable: any) {
    this.payload.push(variable);
  }

  /***
   * Removes an element from the payload at a given index.
   *
   * @param index Index of the variable to remove
   */
  public remove(index: number) {
    this.payload = this.payload
      .slice(0, index)
      .concat(this.payload.slice(index + 1));
  }

  /***
   * Returns a payload variable at a given index.
   *
   * @param index Index of the variable
   * @return The element from the payload at index
   */
  public get(index: number): any {
    return this.payload[index];
  }

  public clear() {
    this.payload = [];
  }

  private decode(rawPayload: number[]) {
    if (rawPayload.length == 0) return;

    let data: any;
    let offset = 0;

    // grab subtype and the remainder of the packet
    let subtype = bufferpack.unpack('b', rawPayload, 0);
    let remainder = rawPayload.slice(1);

    // compare against each subtype and process the data accordingly
    if (subtype & SubType.SUBTYPE_STRING) {
      data = '';
      // loop through all characters of the string
      for (let c in remainder) {
        if (String.fromCharCode(remainder[c]) == '\0')
          // if we find a terminating character, stop
          break;
        data += String.fromCharCode(remainder[c]); // add the character to the data
      }
      offset = data.length + 1; // string is n + 1 bytes (+1 for terminating char)
    } else if (subtype & SubType.SUBTYPE_INT) {
      data = bufferpack?.unpack('<i', remainder)?.[0]; //FIXME: This seems to return incorrect values (big/little endian?)
      offset = 4; // integer is 4 bytes
    } else if (subtype & SubType.SUBTYPE_FLOAT) {
      data = bufferpack?.unpack('<f', remainder)?.[0];
      offset = 4; // float is 4 bytes
    }

    this.payload.push(data); // process last bit of payload that wasn't covered by the loop
    this.decode(remainder.slice(offset));
  }

  /***
   * Converts raw data into a SerialPacket for easy processing.
   *
   * @param data Raw serial data coming from the bridging micro:bit
   */
  public static dataToSerialPacket(data: string): SerialPacket {
    let bytes = [];
    let payload: any[];
    let header: any[];
    for (let i = 0; i < data.length - 1; i++) {
      bytes.push(data.charCodeAt(i));
    }
    // bufferpack.unpack header using header structure
    header = bufferpack.unpack(HEADER_STRUCTURE, bytes.slice(0, HEADER_LENGTH));
    payload = bytes.slice(HEADER_LENGTH);

    // create packet using the header bytes and the payload data
    return new SerialPacket(
      header[0],
      header[1],
      header[2],
      header[3],
      payload
    );
  }
}
