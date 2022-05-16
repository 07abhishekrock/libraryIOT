import type { LoginSession } from "../types";
import { SESSION_KEY } from '../constants';

export function localStorageExists(){
  return typeof window !== 'undefined' && 'localStorage' in window;
}

export function safeJsonParse<T>(val : string){
  try{
    const data = JSON.parse(val) as T;
    return data;
  }
  catch(e){
    return null;
  }
}

export function getLoggedInSession(){
  if(localStorageExists()){

    const userSession = safeJsonParse<LoginSession>(localStorage.getItem('session'));

    return userSession;

  }

  return null;
}

export function isValidSession(){
  const currentUserSession = getLoggedInSession();

  if(currentUserSession){
    if('user' in currentUserSession && 'expiresAt' in currentUserSession){
      const currentTime = Date.now();
      if(currentTime - +currentUserSession.expiresAt > 3600 * 1000){
        return false
      }
      return true;
    }
  }
  return false;

}

export function safeLocalStorageWrite<T>(key : string , val : T){
  if(localStorageExists()){
    const string = JSON.stringify(val);
    localStorage.setItem(key , string);
  }
}

export function createLoginSession(userName : string , email : string){

  const expiresAt = Date.now().toString();

  safeLocalStorageWrite<LoginSession>(SESSION_KEY , {
    expiresAt,
    user : email
  });

}
