import supabase from "../supabase"
import { isBookValid } from "./validators"

import type { BookModel } from "../../types/database";

import { BOOKS_TABLE, ISSUE_DURATION_DEFAULT } from "../../constants";


export const issueBook = async (bookId : string , userId : string)=>{

  const targetBook = await isBookValid(bookId);

  console.log('userid' , userId);

  if(targetBook.issuedBy){
    if(targetBook.issuedBy !== userId){
      throw new Error('This book is already issued by someone else.');
    }
  }

  const {data , error} = await supabase.from<BookModel>(BOOKS_TABLE)
  .update({
    issuedBy : userId,
    issuedTill : (new Date(Date.now() + ISSUE_DURATION_DEFAULT)).toUTCString()
  })
  .eq('bookId' , targetBook.bookId);

  if(error) throw new Error('Some Error Occurred');

  if(data.length === 0) throw new Error('Some Error Occurred');

  return data[0];

}


export const returnBook = async (bookId : string , userId : string)=>{

  const targetBook = await isBookValid(bookId);

  if(targetBook.issuedBy){
    if(targetBook.issuedBy !== userId){
      throw new Error('This book is issued by someone else');
    }
  }

  const {data , error} = await supabase.from<BookModel>(BOOKS_TABLE)
  .update({
    issuedBy : null,
    issuedTill : null
  })
  .eq('bookId' , targetBook.bookId);

  if(error) throw new Error('Some Error Occurred');

  if(data.length === 0) throw new Error('Some Error Occurred');

  return data[0];

}