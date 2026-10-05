import React, { useEffect, useState } from 'react';
import { ProjectTask } from '../types';
import { GanttChartComponent } from '../components/GanttChartComponent';
import { FolderGit2, Calculator, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ProjectManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pmData, setPmData] = useState<{
    tasks: ProjectTask[];
    officialMetrics: any;
    calculatedMetrics: any;
  } | null>(null);

  useEffect(() => {
    loadPMData();
  }, []);

  const loadPMData = async () => {
    setLoading(true);
    try {
      const data = await api.getProjectManagement();
      setPmData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !pmData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Loading Project Management & PERT Data...</p>
      </div>
    );
  }

  const { tasks } = pmData;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Project Management & PERT"
        subtitle="Work Breakdown Structure (WBS), Critical Path Method (CPM), and PERT Three-Point Estimates"
        breadcrumbs={[{ label: 'Project' }, { label: 'Project Management' }]}
        icon={<FolderGit2 className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status="CPM: 35 DAYS" variant="info" />
            <StatusBadge status="PERT: 36 DAYS" variant="warning" />
          </div>
        }
      />

      {/* PERT Calculation Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">PERT Three-Point Estimation — Timetable Engine Module</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block font-semibold">Optimistic (O)</span>
            <strong className="text-2xl font-black text-emerald-600">8 Days</strong>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block font-semibold">Most Likely (M)</span>
            <strong className="text-2xl font-black text-blue-600">12 Days</strong>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block font-semibold">Pessimistic (P)</span>
            <strong className="text-2xl font-black text-rose-600">22 Days</strong>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-800 block font-semibold">PERT Expected Duration (TE)</span>
            <strong className="text-2xl font-black text-amber-700">13 Days</strong>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-100 font-mono text-xs text-slate-700">
          <span className="text-blue-600 font-bold">Formula: </span>
          <code>TE = (O + 4M + P) / 6</code> &rarr; <code>TE = (8 + 4(12) + 22) / 6 = 78 / 6 = 13 Days</code>
        </div>
      </Card>

      {/* Visual Gantt Chart */}
      <GanttChartComponent tasks={tasks} />

      {/* WBS Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Work Breakdown Structure (WBS) & Task Dependencies</CardTitle>
            <CardDescription>Showing {tasks.length} project tasks</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Task Name</th>
                <th className="px-6 py-3.5">Baseline Duration</th>
                <th className="px-6 py-3.5">Dependency</th>
                <th className="px-6 py-3.5">Critical Path?</th>
                <th className="px-6 py-3.5">Responsible Role</th>
                <th className="px-6 py-3.5">PERT Expected</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {tasks.map(t => (
                <tr key={t.task_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{t.task_name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.duration_days} days</td>
                  <td className="px-6 py-4 text-slate-500 font-mono">{t.dependency}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={t.is_critical_path ? 'Critical Path' : 'Parallel Branch'}
                      variant={t.is_critical_path ? 'danger' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-700">{t.responsible_role}</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-600">{t.pert_expected} days</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} variant="success" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
