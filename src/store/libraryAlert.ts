import { writable } from "svelte/store";

export const libraryAlert = writable('');

export function pushAlert(value : string){
  libraryAlert.set(value);
  setTimeout(()=>{
    libraryAlert.set(''); 
  },2000)
}
