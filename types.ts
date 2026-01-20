
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Product {
  name: string;
  price: string;
  features: string[];
  support: string;
  delivery: string;
  image: string;
}

export enum BotStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  ERROR = 'ERROR'
}
