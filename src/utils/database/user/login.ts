import supabase from "../supabase";

import type { AdminModel } from "../../types/database";

import {ADMIN_TABLE} from "../../constants";
import { createLoginSession } from "../../helpers";

function matchPasswords(pwd : string , matchWith : string){
  return pwd === matchWith;
}

export async function loginUser(email : string , password : string){
  if(email && password){
    const {data , error} = await supabase.from<AdminModel>(ADMIN_TABLE).select().eq('adminEmail' , email);
    if(data && !error && data.length > 0){
      if(matchPasswords(data[0].adminPassword , password)){
        createLoginSession(data[0].adminId , data[0].adminEmail);
        return;
      }
    }

    throw new Error('Invalid Login Credentials');
  }

  throw new Error('Email and Password should not be empty');
}