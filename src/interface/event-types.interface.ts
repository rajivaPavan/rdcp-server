export interface UserAccountCreationEvent {
  email: string;
  name: string;
}

export interface UserPasswordResetEvent {
  email: string;
  name: string;
  otp: string;
  otpExpiry: number;
}

export interface EventPayloads {
  'user.account-creation': UserAccountCreationEvent;
  'user.password-reset': UserPasswordResetEvent;
}
