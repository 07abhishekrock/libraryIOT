import {writable} from 'svelte/store';
import {v4 as uuidv4} from 'uuid';

type Device = {
  id : string;
  isActive : boolean;
  isDisabled : boolean;
}

const deviceStore = writable<Device[]>([]);


export const addADevice = ({isActive , isDisabled} : Pick<Device , 'isActive' | 'isDisabled'>)=>{
  deviceStore.update((oldDevices)=>{
    return [...oldDevices , {
      id : uuidv4(),
      isActive,
      isDisabled
    }]
  })
}

export const removeADevice = (id : string)=>{
  deviceStore.update((oldDevices)=>{
    return oldDevices.filter(device=>{
      return device.id !== id
    })
  })
}

export const toggleDisabilityOfADevice = (id : string , disable ?: boolean)=>{
  deviceStore.update((oldDevices)=>{
    return oldDevices.map((device)=>{
      if(device.id === id){
        device.isDisabled = !!disable;
      }
      return device;
    })
  })
}

export const toggleActivityOfDevice = (id : string , activate ?: boolean)=>{
  deviceStore.update((oldDevices)=>{
    return oldDevices.map((device)=>{
      if(device.id === id){
        device.isActive = !!activate;
      }
      return device;
    })
  })
}


export {deviceStore};

