import {writable} from 'svelte/store';
import {v4 as uuidv4} from 'uuid';

type ToastItem = {
  id : string;
  title : string;
  message : string;
  timeoutId : NodeJS.Timeout
}

let toastData = writable<ToastItem[]>([]);

export const addANewToast = ({title, message} : Pick<ToastItem , 'title' | 'message'>)=>{
  toastData.update((data)=>{

    const newId = uuidv4();

    let timeoutId = setTimeout(() => {
      toastData.update((data)=>{
        return data.filter(toast=>toast.id !== newId);
      })
    }, 5000);

    return [...data , {
      title,
      message,
      id : newId,
      timeoutId
    }]
  })
}

export const removeToast = (id : string)=>{
  toastData.update((data)=>{
    return data.filter(toast=>{
      if(toast.id === id){
        clearTimeout(toast.timeoutId);
        return false;
      }
      return true;
    });
  })
}

export {toastData};