import { writable , readable } from "svelte/store";
import type { WebsocketDevice } from "../utils/types";
import {v4 as uuidv4} from 'uuid';

export enum SCREENS{
  //user can go back any time. Give a hard reset option(exit completely option)
  ENTER_DEVICE_CODE, //handle related errors on the screen itself
  SCAN_USER_ID,
  SCAN_BOOKS,
  BOOK_TRANSACTION_SUMMARY, //give user options for issue or refund , show return date as well there under the book in a collapsible card
  ENDING_SCREEN //show ending screen and add options for scan book again or exit completely
}

type BookStatus = {
  status : 'issue',
} | {
  status : 'already-issued',
  issuedTill : string
}


export type ScannedBook = {
  bookId : string;
  bookName : string;
  bookAuthor : string;
  bookStatus : BookStatus
}

type ScannedUser = {
  id : string;
  name : string;
};

export type LibraryTransactionTrain = {
  currentScreen : SCREENS,
  scannedUser ?: ScannedUser;
  scannedBooks : ScannedBook[],
  isLoading : boolean;
  deviceCode ?: string;
  isDeviceOnline ?: boolean;
  allDevicesList : WebsocketDevice[];
  lostConnectionAtScreen : SCREENS | null;
}

const InitialStatus = {
  currentScreen : SCREENS.ENTER_DEVICE_CODE,
  isLoading : false,
  isDeviceOnline : false,
  scannedBooks : [],
  scannedUser : undefined,
  allDevicesList : [],
  lostConnectionAtScreen : null
} as LibraryTransactionTrain;

const LibraryTransaction = writable<LibraryTransactionTrain>(InitialStatus);

const SCREEN_EVENTS = {
    BACK : 'back',
    FORWARD : 'forward',
}

const resetLibrary = ()=>{
  LibraryTransaction.set(InitialStatus);
}

class ScreenEvent{

  public _eventCallbacks : {
    [key : string] : {
      [key : string] : (()=>void)
    }
  }[]

  constructor(){
    this._eventCallbacks = [];
  }

  addEvent(screen : SCREENS , dirn : 'forward' | 'backward' , cb : ()=>void | (()=>Promise<void>)){

    const eventString = getEventString(screen , dirn);

    const cbId = uuidv4();

    if(!(eventString in this._eventCallbacks)){
      this._eventCallbacks[eventString] = {};
    }

    this._eventCallbacks[eventString][cbId] = cb;

    document.addEventListener(eventString , this._eventCallbacks[eventString][cbId]);

    return cbId;

  }

  removeEvent(screen : SCREENS , dirn : 'forward' | 'backward' , cbId : string){

    const eventString = getEventString(screen , dirn);

    if(eventString in this._eventCallbacks){

      if(cbId in this._eventCallbacks[eventString]){
        document.removeEventListener(eventString , this._eventCallbacks[eventString]);
      }
    }

  }

}

const moveToScreen = (screen : SCREENS , type : 'forward' | 'backward')=>{
  LibraryTransaction.update(old=>({
    ...old,
    currentScreen : screen
  }));


  const navigationEvent = new CustomEvent(getEventString(screen , type));

  document.dispatchEvent(navigationEvent);

}


const getEventString = (screen : SCREENS , type : 'forward' | 'backward')=>{
  const eventPrefix = type === 'forward' ? SCREEN_EVENTS.FORWARD : SCREEN_EVENTS.BACK;
  return eventPrefix.concat(screen.toString());
}

const screenEventInstance = readable(new ScreenEvent());

export {LibraryTransaction , InitialStatus , moveToScreen , SCREEN_EVENTS , getEventString , screenEventInstance , resetLibrary}