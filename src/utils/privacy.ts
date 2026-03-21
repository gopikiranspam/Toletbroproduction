import { PrivacySettings } from '../types';

export const isDNDActive = (privacy?: PrivacySettings) => {
  if (!privacy?.doNotDisturb?.enabled) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = privacy.doNotDisturb.startTime.split(':').map(Number);
  const [endH, endM] = privacy.doNotDisturb.endTime.split(':').map(Number);
  
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnights (e.g. 22:00 to 06:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};
