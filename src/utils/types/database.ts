export type AdminModel = {
  adminId : string;
  adminEmail : string;
  adminPassword : string;
  id : string;
}

export type BookModel = {
  id : string;
  bookId : string;
  rfidId : string;
  issuedBy ?: string;
  issuedTill ?: string;
  bookName : string;
}

export type UserModel = {
  id : string;
  name : string;
  userId : string;
  rfid : string;
}