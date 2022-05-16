import type WebSocket from "ws";

import type {MESSAGE_TYPES} from "../constants";

export type LoginSession = {
  user : string;
  expiresAt : string;
}

export type DeviceType = 'device' | 'browser' | 'unknown';

export type appLocals = {
  wsConnections : (WebSocket.WebSocket & {
    isAlive : boolean;
    type : DeviceType;
  })[]
}

export type CustomWebsocket = WebSocket.WebSocket & ({
  id : string;
  type : 'device';
  isAlive : boolean;
  isActive : boolean;
  code ?: string;
} | {
  id : string;
  type : 'browser',
  isAlive : boolean,
  code ?: string;
} | {
  id : string;
  type : 'unknown',
  isAlive : boolean,
  code ?: string
});


export type MessageData = {
  msgType : MESSAGE_TYPES.TELL_DEVICE_TYPE,
  deviceType : DeviceType,
  deviceCode ?: string
} | {
  msgType : MESSAGE_TYPES.ACTIVATE_DEVICE,
  deviceId : string
} | {
  msgType : MESSAGE_TYPES.SEND_ALL_DEVICES_LIST,
  data : WebsocketDevice[]
} | {
  msgType : MESSAGE_TYPES.ASK_INITIAL_DEVICES_LIST,
} | {
  msgType : MESSAGE_TYPES.ASK_RFID_SCAN,
  data : {
    deviceCode : string
  }
} | {
  msgType : MESSAGE_TYPES.SEND_RFID_READ_REQUEST,
  data : {
    transactionId : string
  }
} | {
  msgType : MESSAGE_TYPES.SUCCESS_RFID_SCAN,
  data : {
    transactionId : string,
    rfidValue : string
  }
} | {
  msgType : MESSAGE_TYPES.SEND_REQUESTED_RFID,
  data : { 
    readValue : string
  }
} | {
  msgType : MESSAGE_TYPES.RESET_REMOTE,
  data : {
    deviceCode : string
  }
} | {
  msgType : MESSAGE_TYPES.RESET_YOURSELF
} | {
  msgType : MESSAGE_TYPES.RESET_SUCCESS,
  data : {
    triggeredBy : string
  }
} | {
  msgType : MESSAGE_TYPES.RESET_REMOTE_SUCCESS,
} | {
  msgType : MESSAGE_TYPES.GET_DEVICE_STATUS,
  deviceCode : string;
} | {
  msgType : MESSAGE_TYPES.RESPONSE_DEVICE_STATUS,
  isActive : boolean;
} | {
  msgType : MESSAGE_TYPES.ACKNOWLEDGE_DEVICE_TYPE
} | {
  msgType : MESSAGE_TYPES.CANCEL_PENDING_TRANSACTIONS_FOR_DEVICE,
  deviceCode : string;
}

export type WebsocketDevice = {
  id : string;
  isActive : boolean;
  code ?: string;
}

export type RfidTransaction = {
  transactionId : string;
  tagReceived ?: string;
  askedBy : string;
  transactionType : 'user' | 'book',
  askedTo ?: string;
}