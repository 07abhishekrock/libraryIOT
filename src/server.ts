import express from 'express';
import fs from 'fs';
import path from 'path';
import {createServer as createViteServer, ViteDevServer} from 'vite';
import compression from 'compression';
import serveStatic from 'serve-static';
import {v4 as uuidv4} from 'uuid';
import WebSocket , {WebSocketServer} from 'ws';

import type { appLocals, CustomWebsocket, DeviceType, MessageData, WebsocketDevice, RfidTransaction } from './utils/types';
import { safeJsonParse } from './utils/helpers';
import { sendClientDeviceList } from './utils/helpers/websocket';
import { MESSAGE_TYPES } from './utils/constants';

let js = JSON.stringify;

const createServer = async ()=>{

  let vite : ViteDevServer;
  let root = process.cwd();
  const resolve = (p : string) => path.resolve(root, p)

  const isProd = process.env.NODE_ENV === 'production';
  const isTest = false;
  const app = express();
  const wss = new WebSocketServer<CustomWebsocket>({
    port : 5000
  });

  let pendingTransactions : RfidTransaction[] = [];

  app.locals = {
    wsConnections : []
  } as appLocals;

  if (!isProd) {
    vite = await createViteServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        }
      }
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(compression())
    app.use(
      serveStatic(resolve('dist/client'), {
        index: false
      })
    )
  }

  function setDeviceType(nodeId : string , deviceType : DeviceType , deviceCode ?: string){

    const newWssClients = [...wss.clients].map((client)=>{
      if(client.id === nodeId){
        client.type = deviceType;
        client.code = deviceCode;
      }
      return client;
    })

    wss.clients = new Set(newWssClients);

  }

  function askForRfidCode(askedTo : CustomWebsocket , transactionId : string){

    askedTo && askedTo.send(js({
      msgType : MESSAGE_TYPES.SEND_RFID_READ_REQUEST,
      data : {
        transactionId
      }
    } as MessageData ));

  }

  function onSuccessfullRead(transactionId : string , readValue : string){

    const targetTransaction = pendingTransactions.filter(transaction=>transaction.transactionId === transactionId)[0];

    if(!targetTransaction) return;
    
    const askedByDevice = [...wss.clients].filter(wsNode => wsNode.id === targetTransaction.askedBy)[0];

    if(!askedByDevice) return;

    askedByDevice.send(js({
      msgType : MESSAGE_TYPES.SEND_REQUESTED_RFID,
      data : {
        readValue
      }
    } as MessageData));

    pendingTransactions = pendingTransactions.filter(transaction=>transaction.transactionId !== transactionId);

  }

  function cancelPendingTransactionsForDevice(deviceCode : string){

    const targetDevice = [...wss.clients].filter(device=>device.code === deviceCode)[0];

    if(targetDevice){

      pendingTransactions = pendingTransactions.filter((transaction)=>{
        return transaction.askedTo !== targetDevice.code
      })

    }
  }

  function getAllDevices(){

    const espClientsList = [...wss.clients].filter(client=>client.type === 'device').map<WebsocketDevice>(client=>({
      id : client.id,
      isActive : client.isAlive,
      code : client.code
    }));

    return espClientsList;
  }

  function sendResetSignal(wsNode : CustomWebsocket){
    wsNode.send(js({
      msgType : MESSAGE_TYPES.RESET_YOURSELF,
    } as MessageData));
  }

  function sendBrowserDeviceList(){

    const espClientsList = getAllDevices();

    wss.clients.forEach((client)=>{
      if(client.type === 'browser'){
        sendClientDeviceList(client , espClientsList);
      }
    })
  }

  const findClientById = (id : string)=>{
    let targetDevice : CustomWebsocket;
    wss.clients.forEach((client)=>{
      if(client.id === id){
        targetDevice = client;
      }
    })

    return targetDevice;
  }

  const findDeviceByCode = (code : string)=>{
    let targetDevice : CustomWebsocket;
    wss.clients.forEach((client)=>{
      if(client.code === code){
        targetDevice = client;
      }
    })

    return targetDevice;
  }

  function handleWebsocketMessages(message : WebSocket.RawData , wsNode : CustomWebsocket){
    const messageData = safeJsonParse<MessageData>(message.toString());  
    if(messageData){
      switch(messageData.msgType){

        case MESSAGE_TYPES.TELL_DEVICE_TYPE : {
          setDeviceType(wsNode.id , messageData.deviceType , messageData.deviceCode); 
          sendBrowserDeviceList();
          wsNode.send(js({
            msgType : MESSAGE_TYPES.ACKNOWLEDGE_DEVICE_TYPE
          } as MessageData))
          break;
        }

        case MESSAGE_TYPES.ASK_INITIAL_DEVICES_LIST : {
          const espClients = getAllDevices();
          sendClientDeviceList(wsNode , espClients);
          break;
        }

        //from browser operation sent messages
        case MESSAGE_TYPES.ASK_RFID_SCAN : {
          const targetDevice = findDeviceByCode(messageData.data.deviceCode);
          const transactionId = uuidv4();
          console.log(transactionId);
          pendingTransactions.push({
            transactionId,
            askedBy : wsNode.id,
            askedTo : targetDevice.code,
            transactionType : 'user'
          });
          askForRfidCode(targetDevice , transactionId);
          break;
        }

        case MESSAGE_TYPES.RESET_REMOTE : {
          const deviceToReset = findDeviceByCode(messageData.data.deviceCode);
          sendResetSignal(deviceToReset);
          break;
        }

        case MESSAGE_TYPES.RESET_SUCCESS : {
          const triggeredBy = findClientById(messageData.data.triggeredBy);
          triggeredBy.send(js({
            msgType : MESSAGE_TYPES.RESET_REMOTE_SUCCESS
          } as MessageData));
          break;
        }

        //for client operation sent messages
        case MESSAGE_TYPES.SUCCESS_RFID_SCAN : {
          onSuccessfullRead(messageData.data.transactionId , messageData.data.rfidValue);
          break;
        }

        case MESSAGE_TYPES.GET_DEVICE_STATUS : {
          let targetDevice : CustomWebsocket | null = null;

          wss.clients.forEach((wsNode)=>{
            if(wsNode.type === 'device' && wsNode.code === messageData.deviceCode){
              targetDevice = wsNode;
            }
          })

          let isOpen = false;

          if(targetDevice){
            isOpen = targetDevice.readyState === targetDevice.OPEN;
          }

          wsNode.send(js({
            msgType : MESSAGE_TYPES.RESPONSE_DEVICE_STATUS,
            isActive : isOpen
          } as MessageData));          

          break;
        }

        case MESSAGE_TYPES.CANCEL_PENDING_TRANSACTIONS_FOR_DEVICE : {
          cancelPendingTransactionsForDevice(messageData.deviceCode);
        }

      }

    }
  }

  wss.on('connection' , (ws)=>{

    const id : string = uuidv4();

    ws.id = id;
    ws.isAlive = true;
    
    ws.type = 'unknown';

    ws.on('close' , ()=>{
      ws.isAlive = false;
      sendBrowserDeviceList();
      if(ws.type === 'device'){
        cancelPendingTransactionsForDevice(ws.code);
      }
    })

    ws.on('message' , (message)=>{
      handleWebsocketMessages(message , ws);
    })

  })

     

  app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl

        let html : string , finalHTML : string;
        if (!isProd) {
          // always read fresh template in dev
          html = fs.readFileSync(resolve('index.html'), 'utf-8')
          finalHTML = await vite.transformIndexHtml(url, html);
        } else {
          finalHTML = fs.readFileSync(resolve('dist/index.html') , 'utf-8');
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHTML);
      } catch (e) {
        !isProd && vite.ssrFixStacktrace(e)
        console.log(e.stack)
        res.status(500).end(e.stack)
      }
    })

    return { app, vite }
}

createServer().then(({app})=>{
  app.listen(3002 , ()=>{
      console.log('listening on 3002');
  })
});