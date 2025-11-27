import React, { useState } from 'react';
import { LayoutDashboard, BrainCircuit, BarChart3, Info } from 'lucide-react';
import { TrainingDashboard } from './components/TrainingDashboard';
import { PredictionView } from './components/PredictionView';
import { AppMode, ModelWeights } from './types';
import { initializeWeights } from './services/mlService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TRAINING);
  const [modelWeights, setModelWeights] = useState<ModelWeights>(initializeWeights());
  const [isModelTrained, setIsModelTrained] = useState(false);

  const handleModelReady = (weights: ModelWeights) => {
    setModelWeights(weights);
    setIsModelTrained(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Prophet<span className="text-indigo-600">Estate</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className={`px-2 py-1 rounded ${isModelTrained ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
              Status: {isModelTrained ? 'Model Ready' : 'Untrained'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Info Banner */}
        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Predict House Prices with AI</h2>
            <p className="text-indigo-200 max-w-2xl">
              Train a Linear Regression model directly in your browser using synthetic market data. 
              Then, use it to predict prices, enhanced by Gemini's deep market understanding.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setMode(AppMode.TRAINING)}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 transition-colors relative ${
              mode === AppMode.TRAINING 
                ? 'text-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Model Training
            {mode === AppMode.TRAINING && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            )}
          </button>
          
          <button
            onClick={() => setMode(AppMode.PREDICTION)}
            disabled={!isModelTrained}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 transition-colors relative ${
              mode === AppMode.PREDICTION 
                ? 'text-indigo-600' 
                : !isModelTrained ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Prediction Interface
            {mode === AppMode.PREDICTION && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            )}
            {!isModelTrained && (
              <span className="ml-2 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Train First</span>
            )}
          </button>
        </div>

        {/* View Switcher */}
        <div className="min-h-[500px]">
          {mode === AppMode.TRAINING ? (
            <TrainingDashboard onModelReady={handleModelReady} />
          ) : (
            <PredictionView modelWeights={modelWeights} />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;