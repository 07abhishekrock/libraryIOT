import supabase from "../supabase"
import { USERS_TABLE } from "../../constants";

import type { UserModel } from "../../types/database";

export const findUserByRfidId = async (rfidValue : string)=>{
  const {data , error} = await supabase.from<UserModel>(USERS_TABLE).select().eq('rfid' , rfidValue);

  if(error){
    throw new Error('Something went wrong.');
  }

  if(data.length === 0){
    throw new Error('No user found with that rfid');
  }

  return data[0];

}