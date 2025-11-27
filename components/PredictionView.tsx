import React, { useState } from 'react';
import { Sparkles, Calculator, Home, Bed, Bath, AlertCircle, Loader2 } from 'lucide-react';
import { ModelWeights, PredictionRequest, GeminiAnalysis } from '../types';
import { predictPrice } from '../services/mlService';
import { getGeminiAnalysis } from '../services/geminiService';

interface PredictionViewProps {
  modelWeights: ModelWeights;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ modelWeights }) => {
  const [input, setInput] = useState<PredictionRequest>({
    sqft: 2000,
    bedrooms: 3,
    bathrooms: 2,
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    // 1. Client-side Regression Prediction
    const price = predictPrice(input, modelWeights);
    setPrediction(price);
    setAiAnalysis(null);
    setLoading(true);

    // 2. Gemini API Enhancement
    try {
      const analysis = await getGeminiAnalysis(input, price);
      setAiAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
      {/* Input Form */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500" />
            Property Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Square Footage</label>
              <div className="relative">
                <input 
                  type="number"
                  value={input.sqft}
                  onChange={(e) => setInput({...input, sqft: Number(e.target.value)})}
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bedrooms</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={input.bedrooms}
                    onChange={(e) => setInput({...input, bedrooms: Number(e.target.value)})}
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <Bed className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bathrooms</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={input.bathrooms}
                    onChange={(e) => setInput({...input, bathrooms: Number(e.target.value)})}
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <Bath className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Prediction
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Basic ML Result */}
        {prediction !== null && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-slideUp">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Base Model Estimate</p>
              <h2 className="text-4xl font-bold text-slate-900">
                ${prediction.toLocaleString()}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Based on linear regression of 50 historic points</p>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">SqFt Impact</p>
                <p className="font-semibold text-indigo-600">+${(input.sqft * modelWeights.wSqft).toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Feature Value</p>
                <p className="font-semibold text-indigo-600">
                  +${((input.bedrooms * modelWeights.wBeds) + (input.bathrooms * modelWeights.wBaths)).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gemini Analysis */}
        {aiAnalysis ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-indigo-900">Gemini 2.5 Market Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Refined Valuation</p>
                <p className="text-2xl font-bold text-slate-800">{aiAnalysis.estimatedPriceRange}</p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                 <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Market Sentiment</p>
                 <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.marketSentiment}</p>
              </div>
            </div>

            <div className="mt-6">
               <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Key Value Drivers</p>
               <div className="flex flex-wrap gap-2">
                 {aiAnalysis.keyFactors.map((factor, idx) => (
                   <span key={idx} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-indigo-50">
                     {factor}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        ) : prediction !== null && (
          <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-pulse">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-3" />
            <p className="text-slate-500 font-medium">Analyzing market trends with Gemini...</p>
          </div>
        )}

        {!prediction && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Home className="w-12 h-12 mb-3 opacity-20" />
            <p>Enter property details to see the valuation</p>
          </div>
        )}
      </div>
    </div>
  );
};