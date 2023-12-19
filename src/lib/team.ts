import { randomBytes } from 'node:crypto';

export const generateInviteToken = () => randomBytes(16).toString('hex');
