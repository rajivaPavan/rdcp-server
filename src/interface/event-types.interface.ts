export interface EventPayloads {
  'user.account-creation': { name: string; email: string };
  'user.password-reset': { name: string; email: string; link: string };
}