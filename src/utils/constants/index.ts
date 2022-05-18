export const SESSION_KEY = 'session';

//supabase tables
export const USERS_TABLE = 'users';
export const RFID_TABLE = 'rfids';
export const BOOKS_TABLE = 'books';
export const ADMIN_TABLE = 'admin';

export const BOOK_COLUMNS = {
  BOOK_ID : 'id',
  BOOK_NAME : 'bookName',
  BOOK_ISSUEDBY : 'issuedBy',
  BOOK_ISSUEDTILL : 'issuedTill',
  BOOK_RFID_ID : 'rfidId'
}

export enum MESSAGE_TYPES{
  TELL_DEVICE_TYPE = 'device-type',
  ACKNOWLEDGE_DEVICE_TYPE = 'acknowledge-device-type',
  ACTIVATE_DEVICE = 'activate-device',
  SEND_ALL_DEVICES_LIST = 'devices-list',
  ASK_INITIAL_DEVICES_LIST = 'initial-devices-list',
  ASK_RFID_SCAN = 'ask-user-id-scan',
  SEND_RFID_READ_REQUEST = 'send-rfid-read-request',
  SUCCESS_RFID_SCAN = 'success-rfid-scan',
  SEND_REQUESTED_RFID = 'send-requested-rfid',
  RESET_YOURSELF = 'reset-yourself',
  RESET_REMOTE = 'reset-remote',
  RESET_REMOTE_SUCCESS = 'reset-remote-success',
  RESET_SUCCESS = 'reset-success',
  GET_DEVICE_STATUS = 'get-device-status',
  RESPONSE_DEVICE_STATUS = 'response-device-status',
  CANCEL_PENDING_TRANSACTIONS_FOR_DEVICE = 'cancel-pending-transactions'
}

export const SESSION_TIMEOUT_VALUE = 1000 * 60 * 10;

export const ISSUE_DURATION_DEFAULT = 7 * 24 * 3600 * 1000;

export const PING_TIMEOUT = 1000 * 20;