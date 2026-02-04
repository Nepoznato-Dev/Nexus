import React from 'react';
import { session } from '../Storage/clientStorage.js';
import AIChatBasic from './AIChatBasic.js';
import AIChatExperimental from './AIChat_new.js';

export default function AIChat() {
  const role = session.getRole();
  const hasExperimentalAccess = ['moderator', 'admin', 'owner'].includes(role);

  return hasExperimentalAccess ? <AIChatExperimental /> : <AIChatBasic />;
}
