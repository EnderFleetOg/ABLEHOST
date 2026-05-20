
export const getOfflineResponse = (input: string): string => {
  const lower = input.toLowerCase();
  
  // High-priority keywords
  if (lower.includes('help') || lower.includes('emergency') || lower.includes('sos')) {
    return "I am in Offline Mode. I can still access your Emergency QR and vital profile. Please use the SOS button if you need immediate physical assistance.";
  }
  
  if (lower.includes('time')) {
    return `The current local time is ${new Date().toLocaleTimeString()}. We are offline, but my system clock is accurate.`;
  }
  
  if (lower.includes('task') || lower.includes('to do') || lower.includes('schedule')) {
    return "Your tasks are saved locally on this device. You can view, add, or complete them without internet.";
  }
  
  if (lower.includes('memory') || lower.includes('saved')) {
    return "Your saved knowledge and memories are stored locally and accessible right now.";
  }
  
  if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi') {
    return "Hello! I'm ABLE. I'm currently running on Local Intelligence because we're offline.";
  }
  
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return "I am ABLE, your Humanoid Support System. Even without internet, I'm here to ensure your safety and independence.";
  }

  // Default varied responses
  const fallbacks = [
    "I'm operating in Offline Mode right now. I can still help with your local data and safety protocols.",
    "Web intelligence is currently unavailable, but my Local Core is active. How can I assist with your stored info?",
    "We are offline. I'm focusing on your essential local functions: Tasks, Emergency Profile, and Saved Knowledge."
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};
