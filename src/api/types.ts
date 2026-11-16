export type Outlook = 'Stable' | 'Positive' | 'Negative';

export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  rating: string;
  outlook: Outlook;
  price: number;
  change: number;
  changePct: number;
  marketCapBn: number;
}

export interface Watchlist {
  id: string;
  name: string;
  companies: Company[];
}

export interface RatingAction {
  id: string;
  companyId: string;
  date: string;
  action: string;
  fromRating: string;
  toRating: string;
  outlook: Outlook;
  summary: string;
}

export type AlertType = 'rating' | 'price';
export type AlertDirection = 'above' | 'below';

export interface AlertRequest {
  companyId: string;
  type: AlertType;
  direction?: AlertDirection;
  threshold?: string;
  note: string;
}

export interface Alert {
  id: string;
  companyId: string;
  type: AlertType;
  direction: AlertDirection | null;
  threshold: number | null;
  note: string;
  createdAt: string;
  company: Company;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  field?: string;
  correlationId?: string;
}
