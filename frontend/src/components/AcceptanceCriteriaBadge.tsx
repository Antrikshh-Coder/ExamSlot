import React from 'react';
import { AcceptanceCriteriaStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface Props {
  ac: AcceptanceCriteriaStatus;
}

export const AcceptanceCriteriaBadge: React.FC<Props> = ({ ac }) => {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'PASS':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'FAIL':
        return {
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-400',
          badge: 'bg-rose-500 text-white font-bold',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
        };
      default:
        return {
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-400',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
    }
  };

  const ac1Style = getBadgeStyle(ac.ac1.status);
  const ac2Style = getBadgeStyle(ac.ac2.status);
  const ac3Style = getBadgeStyle(ac.ac3.status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* AC-01 */}
      <div className={`p-4 rounded-xl border ${ac1Style.bg} transition-all duration-200 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Criterion AC-01</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs ${ac1Style.badge}`}>
            {ac.ac1.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {ac1Style.icon}
          <h3 className="font-bold text-white text-base">{ac.ac1.title}</h3>
        </div>
        <p className="text-xs text-slate-300 mt-1">{ac.ac1.details}</p>
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
          <span>Clashes: <strong className="text-white">{ac.ac1.clashesCount}</strong></span>
          <span>Courses: <strong className="text-white">{ac.ac1.timetableCount}</strong></span>
        </div>
      </div>

      {/* AC-02 */}
      <div className={`p-4 rounded-xl border ${ac2Style.bg} transition-all duration-200 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Criterion AC-02</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs ${ac2Style.badge}`}>
            {ac.ac2.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {ac2Style.icon}
          <h3 className="font-bold text-white text-base">{ac.ac2.title}</h3>
        </div>
        <p className="text-xs text-slate-300 mt-1">{ac.ac2.details}</p>
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
          <span>Seated: <strong className="text-white">{ac.ac2.percentageSeated}%</strong></span>
          <span>Unseated: <strong className="text-white">{ac.ac2.unseatedCount}</strong></span>
        </div>
      </div>

      {/* AC-03 */}
      <div className={`p-4 rounded-xl border ${ac3Style.bg} transition-all duration-200 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Criterion AC-03</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs ${ac3Style.badge}`}>
            {ac.ac3.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {ac3Style.icon}
          <h3 className="font-bold text-white text-base">{ac.ac3.title}</h3>
        </div>
        <p className="text-xs text-slate-300 mt-1">{ac.ac3.details}</p>
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
          <span>Exam Date: <strong className="text-white truncate max-w-[120px] inline-block align-bottom">{ac.ac3.examDate}</strong></span>
          <span>Diff: <strong className="text-white">{ac.ac3.daysDifference !== null ? `${ac.ac3.daysDifference} days` : 'N/A'}</strong></span>
        </div>
      </div>
    </div>
  );
};
