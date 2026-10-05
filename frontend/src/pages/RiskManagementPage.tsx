import React, { useEffect, useState } from 'react';
import { Risk } from '../types';
import { RiskMatrixComponent } from '../components/RiskMatrixComponent';
import { ShieldAlert, LifeBuoy, Database, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';

export const RiskManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<Risk[]>([]);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const data = await api.getRisks();
      setRisks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Loading Risk Register Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Risk Register & Disaster Recovery"
        subtitle="Probability-Impact Risk Evaluation, Contingency Plans, and Emergency Protocols"
        breadcrumbs={[{ label: 'Quality' }, { label: 'Risk Management' }]}
        icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
        actions={
          <Button
            variant="outline"
            onClick={loadRisks}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Register
          </Button>
        }
      />

      {/* Visual Risk Matrix */}
      <RiskMatrixComponent risks={risks} />

      {/* Disaster Recovery Section */}
      <Card className="p-6 border-l-4 border-l-blue-600 space-y-4">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">Disaster Recovery & Manual Fallback Protocols</h3>
        </div>
        <p className="text-xs text-slate-600">
          The examination start date is fixed by the university and cannot be delayed. If infrastructure experiences outage, the following protocol takes effect:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-blue-600 mb-1">
              <Database className="w-4 h-4" /> Step 1: Data Preservation
            </div>
            <p className="text-slate-600">
              Daily automated backup of database snapshots (<code className="text-slate-800 font-mono">examslot.db</code>) to offline secure storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-amber-600 mb-1">
              <FileSpreadsheet className="w-4 h-4" /> Step 2: Master CSV Export
            </div>
            <p className="text-slate-600">
              Pre-export all timetable, room seating allocations, and invigilator duties to CSV & printable PDF sheets before exam start date.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-emerald-600 mb-1">
              <LifeBuoy className="w-4 h-4" /> Step 3: Spreadsheet Process Fallback
            </div>
            <p className="text-slate-600">
              In case of total server outage, the Examination Cell temporarily reverts to spreadsheet process using saved master CSV sheets.
            </p>
          </div>
        </div>
      </Card>

      {/* Risk Register Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Risk Register Log</CardTitle>
            <CardDescription>Showing {risks.length} evaluated risk items</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Risk ID</th>
                <th className="px-6 py-3.5">Risk Description</th>
                <th className="px-6 py-3.5">Prob × Impact</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5">Mitigation Strategy</th>
                <th className="px-6 py-3.5">Contingency Plan</th>
                <th className="px-6 py-3.5">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {risks.map(r => (
                <tr key={r.risk_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">{r.risk_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs">{r.description}</td>
                  <td className="px-6 py-4 text-slate-600">{r.probability} × {r.impact}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={String(r.risk_score)}
                      variant={r.risk_score >= 12 ? 'danger' : 'warning'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-700">{r.mitigation}</td>
                  <td className="px-6 py-4 text-slate-500 italic">{r.contingency}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
