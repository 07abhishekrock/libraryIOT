import supabase from "../supabase"

import { BOOKS_TABLE } from "../../constants";

import type { BookModel } from "../../types/database";

export const isBookValid = async (bookId : string)=>{
  const {data , error} = await supabase.from<BookModel>(BOOKS_TABLE).select().eq('bookId' , bookId);

  if(data && !error){
    if(data.length === 0){
      throw new Error('Invalid Book Id');
    }
    return data[0];
  }

  throw new Error('Something went wrong');
}

export const isBookValidRfid = async (bookId : string)=>{
  const {data , error} = await supabase.from<BookModel>(BOOKS_TABLE).select().eq('rfidId', bookId);

  if(data && !error){
    if(data.length === 0){
      throw new Error('Invalid Book Scanned');
    }
    return data[0];
  }

  throw new Error('Something went wrong');
}