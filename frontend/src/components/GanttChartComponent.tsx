import React from 'react';
import { ProjectTask } from '../types';
import { CheckCircle, Clock } from 'lucide-react';

interface Props {
  tasks: ProjectTask[];
}

export const GanttChartComponent: React.FC<Props> = ({ tasks }) => {
  // Calculate total days (cumulative timeline)
  const totalDays = 36; // PERT adjusted critical path

  const taskStartOffset: { [key: number]: number } = {
    1: 0,  // Requirements (5d): 0..5
    2: 5,  // Rules Doc (4d): 5..9
    3: 9,  // Timetable Engine (12d, PERT 13d): 9..22
    4: 9,  // Seating Module (8d parallel): 9..17
    5: 22, // Hall Ticket Pub (5d): 22..27
    6: 27, // Testing (6d): 27..33
    7: 33, // Dry Run (3d): 33..36
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Project Schedule & Critical Path Gantt Chart
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Official Critical Path: Requirements → Rules Doc → Timetable Engine → Hall Ticket Publishing → Testing → Dry Run
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/50 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical Path Task
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Parallel Branch Task
          </span>
        </div>
      </div>

      {/* Days Scale */}
      <div className="grid grid-cols-36 gap-0 border-b border-slate-800 pb-2 mb-4 text-[10px] text-slate-500 font-mono hidden md:grid">
        {Array.from({ length: totalDays }, (_, i) => (
          <div key={i} className="text-center">
            {(i + 1) % 5 === 0 || i === 0 || i === 35 ? `D${i + 1}` : '|'}
          </div>
        ))}
      </div>

      {/* Task Bars */}
      <div className="space-y-4">
        {tasks.map(task => {
          const startDay = taskStartOffset[task.task_id] || 0;
          const duration = task.task_id === 3 ? 13 : task.duration_days; // Use PERT 13d for Timetable Engine
          const leftPercent = (startDay / totalDays) * 100;
          const widthPercent = (duration / totalDays) * 100;

          return (
            <div key={task.task_id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  {task.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {task.task_name}
                  {task.is_critical_path && (
                    <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded font-mono">CP</span>
                  )}
                </span>
                <span className="text-slate-400 font-mono">
                  {duration} days (Start: Day {startDay + 1} → End: Day {startDay + duration})
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-7 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800">
                <div
                  className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[11px] font-bold text-white transition-all ${
                    task.is_critical_path
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 shadow-lg shadow-rose-950'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  <span className="truncate">{task.duration_days}d {task.pert_expected ? `(PERT ${task.pert_expected}d)` : ''}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="mt-6 p-4 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Original Critical Path</span>
          <p className="text-xl font-extrabold text-white">35 Days</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">PERT Adjusted Path</span>
          <p className="text-xl font-extrabold text-amber-400">36 Days</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Timetable Engine PERT</span>
          <p className="text-xl font-extrabold text-blue-400">13 Days</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Parallel Branch (Seating)</span>
          <p className="text-xl font-extrabold text-emerald-400">8 Days</p>
        </div>
      </div>
    </div>
  );
};
