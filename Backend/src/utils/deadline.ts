export const calculateDeadline = (): Date => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  
  let deadline = new Date(now);
  
  // Monday to Thursday (1-4)
  if (currentDay >= 1 && currentDay <= 4) {
    // Set deadline to next day
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(23, 59, 59, 999);
  } 
  // Friday, Saturday, Sunday (5, 6, 0)
  else {
    // Set deadline to Monday
    const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
    deadline.setDate(deadline.getDate() + daysUntilMonday);
    deadline.setHours(23, 59, 59, 999);
  }
  
  return deadline;
};

export const formatDeadline = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
};
