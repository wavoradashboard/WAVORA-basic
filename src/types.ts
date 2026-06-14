export type Plan = 'Basic';

export type TrackStatus = 'Submitted' | 'Approved' | 'Rejected' | 'Live';

export interface User {
  id?: string;
  email: string;
  password?: string; // Optional during session use but required in storage
  artistName: string;
  plan: Plan;
  isApproved: boolean;
  registeredAt: string;
  planStartDate?: string;
  planEndDate?: string;
  allowedCLines?: string[];
  allowedPLines?: string[];
  upiId?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankHolderName?: string;
}

export interface ArtistProfile {
  id: string;
  email: string;
  name: string;
  spotifyLink: string;
  appleMusicLink: string;
  instagramLink: string;
  defaultCLine?: string;
  defaultPLine?: string;
}

export interface Label {
  id: string;
  email: string;
  name: string;
}

export interface ReleaseTrack {
  id: string;
  trackName: string;
  mainArtistName: string;
  featureArtists: string[];
  otherArtists: string[];
  genre: string;
  subGenre: string;
  language: string;
  producer: string;
  lyricist: string;
  composer: string;
  isrc?: string;
  explicitContent: boolean;
  contentId?: 'Yes' | 'No';
  lyrics?: string;
  audioFileName?: string;
  googleDriveLink?: string;
}

export interface Release {
  id: string;
  email: string;
  albumName: string;
  type: 'Single' | 'EP' | 'Album';
  mainArtistName: string;
  featureArtists: string[];
  otherArtists: string[];
  language: string;
  contentType: 'Original' | 'Non-Exclusive' | 'AI Music' | 'Licensed' | 'AI' | '';
  numTracks: number;
  genre: string;
  subGenre: string;
  labelName?: string;
  upc?: string;
  contentId?: 'Yes' | 'No';
  cLine?: string;
  pLine?: string;
  releaseDate: string;
  coverArtUrl: string;
  coverArtSignedUrl?: string;
  tracks: ReleaseTrack[];
  specialRequest?: string;
  status: TrackStatus;
  submittedAt: string;
  feedback?: string;
}

export interface RevenueReport {
  id: string;
  email: string;
  month: string;
  amount: number;
  breakdown: { releaseName: string; amount: number }[];
  currency?: 'USD' | 'INR';
}

export interface SupportQuery {
  id: string;
  email: string;
  artistName: string;
  queryText: string;
  submittedAt: string;
  status: 'Pending' | 'Resolved';
  replyText?: string;
}

export interface OacApplication {
  id: string;
  email: string;
  artistName: string;
  spotifyLink: string;
  youtubeLink: string;
  fullName: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: 'Everyone' | 'Plan' | 'Artist';
  targetValue?: string; // specific plan ('Basic' | 'Pro' | 'Elite') or artist email
  severity: 'Info' | 'Warning' | 'Success' | 'Critical';
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  email: string;
  artistName: string;
  amount: number;
  currency: 'USD' | 'INR';
  paymentMethod: 'UPI' | 'Bank';
  paymentDetails: {
    upiId?: string;
    bankName?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
    bankHolderName?: string;
  };
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

