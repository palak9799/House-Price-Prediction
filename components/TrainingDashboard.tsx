import React, { useEffect, useState, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, RotateCcw, Activity, CheckCircle } from 'lucide-react';
import { HouseData, ModelWeights, TrainingMetrics } from '../types';
import { generateDataset, initializeWeights, trainStep, predictPrice } from '../services/mlService';

interface TrainingDashboardProps {
  onModelReady: (weights: ModelWeights) => void;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ onModelReady }) => {
  const [data, setData] = useState<HouseData[]>([]);
  const [weights, setWeights] = useState<ModelWeights>(initializeWeights());
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Use ref to keep track of weights inside the interval without re-binding
  const weightsRef = useRef(weights);
  // Initialize with 0 to satisfy type requirements (expected 1 argument)
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    const dataset = generateDataset(50);
    setData(dataset);
  }, []);

  const resetTraining = () => {
    const newWeights = initializeWeights();
    setWeights(newWeights);
    weightsRef.current = newWeights;
    setMetrics([]);
    setProgress(0);
    setIsTraining(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const startTraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    let epoch = 0;
    const maxEpochs = 200;

    const runEpoch = () => {
      if (epoch >= maxEpochs) {
        setIsTraining(false);
        onModelReady(weightsRef.current);
        return;
      }

      // Run multiple steps per frame to speed up visuals
      for (let i = 0; i < 5; i++) {
        const { newWeights, loss } = trainStep(data, weightsRef.current);
        weightsRef.current = newWeights;
        
        // Very rough R-squared approximation for visual "accuracy"
        // In real linear regression, R2 = 1 - (SSres / SStot)
        const avgPrice = data.reduce((a, b) => a + b.price, 0) / data.length;
        const ssTot = data.reduce((a, b) => a + Math.pow(b.price - avgPrice, 2), 0);
        const ssRes = data.reduce((a, b) => a + Math.pow(b.price - predictPrice(b, newWeights), 2), 0);
        const accuracy = Math.max(0, 1 - (ssRes / ssTot)); // Clamp at 0

        if (i === 4) { // Only update state once per frame group
           setWeights(newWeights);
           setMetrics(prev => [...prev.slice(-49), { epoch: epoch + i, loss, accuracy }]);
           setProgress(((epoch) / maxEpochs) * 100);
        }
      }
      
      epoch += 5;
      animationRef.current = requestAnimationFrame(runEpoch);
    };

    runEpoch();
  };

  // Prepare chart data: Scatter points + Regression Line
  const chartData = data.map(pt => ({
    sqft: pt.sqft,
    price: pt.price,
    predicted: predictPrice(pt, weights)
  })).sort((a, b) => a.sqft - b.sqft);

  // We only draw the line based on the min/max sqft to keep it clean
  const regressionLine = [
    { sqft: 800, predicted: predictPrice({ sqft: 800, bedrooms: 1, bathrooms: 1 }, weights) }, // simplified visual
    { sqft: 3500, predicted: predictPrice({ sqft: 3500, bedrooms: 4, bathrooms: 3 }, weights) }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Main Chart */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Regression Analysis (Price vs SqFt)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="sqft" 
                  name="SqFt" 
                  unit=" ft²" 
                  domain={['dataMin', 'dataMax']} 
                  tick={{fontSize: 12, fill: '#64748b'}}
                />
                <YAxis 
                  type="number" 
                  dataKey="price" 
                  name="Price" 
                  unit="$" 
                  tickFormatter={(val) => `$${val/1000}k`}
                  tick={{fontSize: 12, fill: '#64748b'}}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Houses" data={chartData} fill="#6366f1" fillOpacity={0.6} />
                <Scatter name="Model" data={chartData} line={{ stroke: '#ec4899', strokeWidth: 2 }} shape={() => <></>} /> 
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics & Controls */}
        <div className="w-full md:w-80 space-y-4">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Model Performance</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Accuracy</span>
                <span className="font-bold text-emerald-600">
                  {metrics.length > 0 ? (metrics[metrics.length - 1].accuracy * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.length > 0 ? metrics[metrics.length - 1].accuracy * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Training Loss</span>
                <span className="font-mono text-xs text-rose-500">
                  {metrics.length > 0 ? metrics[metrics.length - 1].loss.toFixed(0) : '0.0'}
                </span>
              </div>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <Line type="monotone" dataKey="loss" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex gap-2">
               {!isTraining && progress < 100 ? (
                 <button 
                  onClick={startTraining}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                 >
                   <Play className="w-4 h-4" /> Start Training
                 </button>
               ) : (
                 <button 
                  onClick={resetTraining}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                 >
                   <RotateCcw className="w-4 h-4" /> Reset
                 </button>
               )}
            </div>
            
            {progress >= 100 && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" /> Training Complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};