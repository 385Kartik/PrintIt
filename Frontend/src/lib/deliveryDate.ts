/**
 * Calculate delivery date based on current day
 * Monday to Thursday: Tomorrow at 10 AM
 * Friday to Sunday: Monday at 10 AM
 */
export const calculateDeliveryDate = (): { date: Date; text: string } => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  let deliveryDate = new Date(now);
  
  // Monday to Thursday (1-4)
  if (currentDay >= 1 && currentDay <= 4) {
    // Set delivery to tomorrow at 10 AM
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    deliveryDate.setHours(10, 0, 0, 0);
  } 
  // Friday, Saturday, Sunday (5, 6, 0)
  else {
    // Set delivery to Monday at 10 AM
    const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay);
    deliveryDate.setDate(deliveryDate.getDate() + daysUntilMonday);
    deliveryDate.setHours(10, 0, 0, 0);
  }
  
  return {
    date: deliveryDate,
    text: formatDeliveryDate(deliveryDate)
  };
};

/**
 * Format delivery date to human-readable text
 */
const formatDeliveryDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return `${dayOfWeek} at ${timeStr}`;
  }
};

export default calculateDeliveryDate;
