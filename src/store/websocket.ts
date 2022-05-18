import {writable} from "svelte/store";
import { MESSAGE_TYPES } from "../utils/constants";
import type { MessageData } from "../utils/types";



//tell your device type

const initialiseWebsocket = ()=>{

  let websocketURL = window.location.origin.concat('/socket');
  if(websocketURL.startsWith('https://')){
    websocketURL = websocketURL.replace('https://' , 'wss://');
  }
  else{
    websocketURL = websocketURL.replace('http://' , 'ws://');
  }
  
  const ws = new WebSocket(websocketURL);

  const waitForWebsocketToBecomeActive = ()=>{
    return new Promise((resolve , reject)=>{
      if(ws.readyState === ws.OPEN){
        resolve('already connected');
        return;
      }
      ws.addEventListener('open' , ()=>{
        console.log('hello world');
        resolve('connected websocket instance');
      })
    }); 
  }
  
  ws.addEventListener('open' , (ev)=>{
    
    console.log('open');
    
    ws.send(JSON.stringify({
      msgType : MESSAGE_TYPES.TELL_DEVICE_TYPE,
      deviceType : 'browser'
    } as MessageData));

    libraryWebsocket.update((old)=>({
      ...old,
      websocketInstance : ws,
      sendMsg : async (msgData : MessageData)=>{
        console.log(msgData);
        await waitForWebsocketToBecomeActive();
        ws.send(JSON.stringify(msgData));
      },
      cancelTransactionsForDevice : async (deviceCode : string)=>{
        console.log('hello i was tried');
        await waitForWebsocketToBecomeActive();
        ws.send(JSON.stringify({
          msgType : MESSAGE_TYPES.CANCEL_PENDING_TRANSACTIONS_FOR_DEVICE,
          deviceCode 
        } as MessageData));
      }
    }));

  });
  
  ws.addEventListener('message' , (ev)=>{
    
    
    const data = JSON.parse(ev.data) as MessageData;
    
    console.log(data);
    
    if('msgType' in data){
      
      const customEvent = new CustomEvent(data.msgType , {
        detail : data
      });
      
      document.dispatchEvent(customEvent);
      
    }
    
  })
  
}




const libraryWebsocket = writable({
  websocketInstance : null,
  sendMsg : (msgData : MessageData)=>{},
  cancelTransactionsForDevice : (deviceCode : string)=>{}
} as {
  websocketInstance : WebSocket | null,
  sendMsg : (msgData : MessageData)=>Promise<void>,
  cancelTransactionsForDevice : (deviceCode : string)=>void
});


export default libraryWebsocket;
export {initialiseWebsocket};

