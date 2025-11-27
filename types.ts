export interface HouseData {
  id: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
}

export interface PredictionRequest {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
}

export interface ModelWeights {
  wSqft: number;
  wBeds: number;
  wBaths: number;
  bias: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number; // Simulated R-squared for display
}

export interface GeminiAnalysis {
  estimatedPriceRange: string;
  marketSentiment: string;
  keyFactors: string[];
}

export enum AppMode {
  TRAINING = 'TRAINING',
  PREDICTION = 'PREDICTION',
}