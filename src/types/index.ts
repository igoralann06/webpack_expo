import type { Timestamp } from 'firebase/firestore';

export const NOTE_CATEGORIES = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Work', value: 'Work' },
  { label: 'Wishlist', value: 'Wishlist' },
];

export interface SignupDto {
  fullname: string;
  email: string;
  password: string;
  phoneNumber: string;
  photoURL: string;
  photo?: File;
}

export interface IUserData {
  id: string;
  fullname: string;
  email?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  trimPhoneNumber?: string;
  phoneVerified?: boolean;
  twilioCallID?: string;
  userCreated?: Date;
}

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface ICallLog {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  type: string;
  rawType: number;
  timestamp: string;
  duration: number;
  dateTime: string;
  displayName: string;
  callType: string;
}

export interface IDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  isPrimary: boolean;
  linkedAt: Timestamp;
  location?: ILocation;
}

export interface INote {
  id: string;
  title: string;
  note: string;
  userId: string;
  category: string;
  createdAt: Timestamp;
}

export interface IVideoChannel {
  id: string;
  caller: string;
  callerName: string;
  receiver: string;
  receiverName: string;
  members: string[];
  channelData: IChannel;
  status: string;
  timestamp: number;
}

export interface IChannel {
  channelName: string;
  token: string;
}

export interface IContact {
  id: string;
  userId?: string;
  uniqId?: string;
  deleted?: boolean;
  data: IContactData;
  updated?: boolean;
}

export interface IContactData {
  id?: string;
  company?: string;
  familyName?: string;
  middleName?: string;
  givenName?: string;
  hasThumbnail?: boolean;
  birthday?: { year: number; month: number; day: number };
  emailAddresses?: IEmailAddress[];
  imAddresses?: string[];
  jobTitle?: string;
  phoneNumbers?: IPhoneNumber[];
  postalAddresses?: IAddress[];
  recordID?: string;
  thumbnailPath?: string;
  displayName?: string;
  isCustom?: boolean;
  title?: string;
  description?: string;
  label?: string;
}

export interface IPhoneNumber {
  label?: string;
  number: string;
}

export interface IEmailAddress {
  label: string;
  email: string;
}

export interface IAddress {
  label?: string;
}

export interface ISMSLog {
  id: string;
  userId: string;
  _id: string;
  address: string;
  announcements_subtype?: number;
  app_id?: number;
  bin_info?: number;
  body: string;
  correlation_tag?: string;
  creator?: string;
  d_rpt_cnt?: number;
  date: bigint;
  date_sent?: number;
  deletable?: number;
  error_code?: number;
  favorite?: number;
  hidden?: number;
  locked?: number;
  msg_id?: number;
  pri?: number;
  re_type?: number;
  read?: number;
  reserved?: number;
  roam_pending?: number;
  safe_message?: number;
  secret_mode?: number;
  seen?: number;
  sim_slot?: number;
  spam_report?: number;
  status?: number;
  sub_id?: number;
  svc_cmd?: number;
  teleservice_id?: number;
  thread_id?: number;
  type: number;
  using_mode?: number;
}

export interface IVideoCallData {
  type: number;
  channelData?: IChannel;
  otherUser: IUserData;
  dataId?: string;
}

export interface CreateVideoCallChannelRes {
  status: number;
  message?: string;
  channelName?: string;
  token?: string;
  dataId?: string;
}
