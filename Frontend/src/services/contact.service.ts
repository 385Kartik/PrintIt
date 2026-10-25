const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ContactPayload {
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async sendContactMessage(payload: ContactPayload): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/support/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send message' }));
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  },
};
