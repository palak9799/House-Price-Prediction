import { HouseData, ModelWeights, PredictionRequest } from '../types';

// Synthetic dataset generation with some noise to make it realistic
export const generateDataset = (size: number = 100): HouseData[] => {
  const data: HouseData[] = [];
  for (let i = 0; i < size; i++) {
    const sqft = Math.floor(Math.random() * (3500 - 800) + 800);
    const bedrooms = Math.floor(sqft / 800) + Math.floor(Math.random() * 2);
    const bathrooms = Math.max(1, Math.floor(bedrooms / 1.5) + (Math.random() > 0.5 ? 1 : 0));
    
    // Base price calculation: $200/sqft + $25k/bed + $15k/bath + random noise
    const basePrice = (sqft * 200) + (bedrooms * 25000) + (bathrooms * 15000) + 50000;
    const noise = (Math.random() - 0.5) * 40000; // +/- 20k noise
    const price = Math.round(basePrice + noise);

    data.push({ id: i, sqft, bedrooms, bathrooms, price });
  }
  return data;
};

// Initial random weights
export const initializeWeights = (): ModelWeights => ({
  wSqft: Math.random(),
  wBeds: Math.random(),
  wBaths: Math.random(),
  bias: Math.random() * 1000,
});

// Single step of Gradient Descent
export const trainStep = (
  data: HouseData[],
  weights: ModelWeights,
  learningRate: number = 0.0000001
): { newWeights: ModelWeights; loss: number } => {
  let wSqftGrad = 0;
  let wBedsGrad = 0;
  let wBathsGrad = 0;
  let biasGrad = 0;
  let totalError = 0;

  const N = data.length;

  data.forEach((house) => {
    // Prediction = w1*x1 + w2*x2 + w3*x3 + b
    const prediction = 
      (weights.wSqft * house.sqft) + 
      (weights.wBeds * house.bedrooms) + 
      (weights.wBaths * house.bathrooms) + 
      weights.bias;

    const error = prediction - house.price;
    totalError += error * error;

    // Gradients: d(Error)/dw = 2 * error * x
    wSqftGrad += 2 * error * house.sqft;
    wBedsGrad += 2 * error * house.bedrooms;
    wBathsGrad += 2 * error * house.bathrooms;
    biasGrad += 2 * error;
  });

  // MSE
  const loss = totalError / N;

  // Update weights
  const newWeights: ModelWeights = {
    wSqft: weights.wSqft - (learningRate * wSqftGrad / N),
    wBeds: weights.wBeds - (learningRate * wBedsGrad / N),
    wBaths: weights.wBaths - (learningRate * wBathsGrad / N),
    bias: weights.bias - (learningRate * biasGrad / N),
  };

  return { newWeights, loss };
};

export const predictPrice = (input: PredictionRequest, weights: ModelWeights): number => {
  return (
    (weights.wSqft * input.sqft) +
    (weights.wBeds * input.bedrooms) +
    (weights.wBaths * input.bathrooms) +
    weights.bias
  );
};