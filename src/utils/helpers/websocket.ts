import { MESSAGE_TYPES } from "../constants";
import type { CustomWebsocket , MessageData, WebsocketDevice } from "../types";

export function sendClientDeviceList(client : CustomWebsocket , devicesList : WebsocketDevice[]){
  client.send(JSON.stringify({
    msgType : MESSAGE_TYPES.SEND_ALL_DEVICES_LIST,
    data : devicesList
  }  as MessageData ));
}
