import React from 'react';
import { Risk } from '../types';
import { ShieldAlert } from 'lucide-react';

interface Props {
  risks: Risk[];
}

export const RiskMatrixComponent: React.FC<Props> = ({ risks }) => {
  const probMap: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
  const impMap: { [key: string]: number } = { Critical: 3, High: 2, Medium: 1, Low: 1 };

  const getCellColor = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score >= 6) return 'bg-rose-950/80 border-rose-600 text-rose-300';
    if (score >= 3) return 'bg-amber-950/80 border-amber-600 text-amber-300';
    return 'bg-emerald-950/80 border-emerald-600 text-emerald-300';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-rose-400" />
        Probability × Impact Risk Assessment Matrix
      </h3>

      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {/* Header Row */}
        <div className="p-2 text-slate-500 font-bold">Prob \ Impact</div>
        <div className="p-2 text-slate-300 bg-slate-800/60 rounded">Medium (1)</div>
        <div className="p-2 text-slate-300 bg-slate-800/60 rounded">High (2)</div>
        <div className="p-2 text-slate-300 bg-slate-800/60 rounded">Critical (3)</div>

        {/* High Prob Row */}
        <div className="p-3 text-slate-300 bg-slate-800/60 rounded flex items-center justify-center font-bold">High (3)</div>
        {[1, 2, 3].map(imp => {
          const matchingRisks = risks.filter(r => probMap[r.probability] === 3 && impMap[r.impact] === imp);
          return (
            <div key={`3-${imp}`} className={`p-3 border rounded-lg min-h-[70px] flex flex-col items-center justify-center ${getCellColor(3, imp)}`}>
              {matchingRisks.map(r => (
                <span key={r.risk_id} className="text-xs font-extrabold px-2 py-1 bg-slate-900/90 rounded border border-current my-0.5" title={r.description}>
                  {r.risk_id}: Score {r.risk_score}
                </span>
              ))}
              {matchingRisks.length === 0 && <span className="text-[10px] opacity-40">None</span>}
            </div>
          );
        })}

        {/* Medium Prob Row */}
        <div className="p-3 text-slate-300 bg-slate-800/60 rounded flex items-center justify-center font-bold">Medium (2)</div>
        {[1, 2, 3].map(imp => {
          const matchingRisks = risks.filter(r => probMap[r.probability] === 2 && impMap[r.impact] === imp);
          return (
            <div key={`2-${imp}`} className={`p-3 border rounded-lg min-h-[70px] flex flex-col items-center justify-center ${getCellColor(2, imp)}`}>
              {matchingRisks.map(r => (
                <span key={r.risk_id} className="text-xs font-extrabold px-2 py-1 bg-slate-900/90 rounded border border-current my-0.5" title={r.description}>
                  {r.risk_id}: Score {r.risk_score}
                </span>
              ))}
              {matchingRisks.length === 0 && <span className="text-[10px] opacity-40">None</span>}
            </div>
          );
        })}

        {/* Low Prob Row */}
        <div className="p-3 text-slate-300 bg-slate-800/60 rounded flex items-center justify-center font-bold">Low (1)</div>
        {[1, 2, 3].map(imp => {
          const matchingRisks = risks.filter(r => probMap[r.probability] === 1 && impMap[r.impact] === imp);
          return (
            <div key={`1-${imp}`} className={`p-3 border rounded-lg min-h-[70px] flex flex-col items-center justify-center ${getCellColor(1, imp)}`}>
              {matchingRisks.map(r => (
                <span key={r.risk_id} className="text-xs font-extrabold px-2 py-1 bg-slate-900/90 rounded border border-current my-0.5" title={r.description}>
                  {r.risk_id}: Score {r.risk_score}
                </span>
              ))}
              {matchingRisks.length === 0 && <span className="text-[10px] opacity-40">None</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
