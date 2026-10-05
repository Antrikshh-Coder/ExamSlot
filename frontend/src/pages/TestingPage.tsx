import React, { useState } from 'react';
import { TestCase } from '../types';
import { CheckSquare, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Props {
  testCases: TestCase[];
  onUpdateTestCase: (id: string, status: 'Not Run' | 'Pass' | 'Fail' | 'Blocked', actual: string) => Promise<void>;
}

export const TestingPage: React.FC<Props> = ({ testCases, onUpdateTestCase }) => {
  const [activeTab, setActiveTab] = useState<'suite' | 'techniques'>('suite');

  const passRate = Math.round((testCases.filter(t => t.status === 'Pass').length / testCases.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Testing & QA Suite"
        subtitle="Requirements Validation (FR-01 to FR-10) & Acceptance Criteria Audit (AC-01 to AC-03)"
        breadcrumbs={[{ label: 'Quality' }, { label: 'Testing & QA' }]}
        icon={<CheckSquare className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'suite' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('suite')}
            >
              Test Execution Suite
            </Button>
            <Button
              variant={activeTab === 'techniques' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('techniques')}
            >
              BVA & Test Techniques
            </Button>
          </div>
        }
      />

      {activeTab === 'suite' && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Academic System Test Cases</CardTitle>
              <CardDescription>Showing {testCases.length} verified functional test suites</CardDescription>
            </div>
            <StatusBadge status={`PASS RATE ${passRate}%`} variant={passRate === 100 ? 'success' : 'warning'} />
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Test ID</th>
                  <th className="px-6 py-3.5">Target Module</th>
                  <th className="px-6 py-3.5">Test Description</th>
                  <th className="px-6 py-3.5">Expected Result</th>
                  <th className="px-6 py-3.5">Actual Result</th>
                  <th className="px-6 py-3.5 text-right">Execution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {testCases.map(tc => (
                  <tr key={tc.test_case_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{tc.test_case_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{tc.module}</td>
                    <td className="px-6 py-4 text-slate-700">{tc.description}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{tc.expected_result}</td>
                    <td className="px-6 py-4 text-slate-800">{tc.actual_result}</td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={tc.status}
                        onChange={e =>
                          onUpdateTestCase(
                            tc.test_case_id,
                            e.target.value as any,
                            tc.actual_result
                          )
                        }
                        className="bg-white border border-slate-300 rounded px-2.5 py-1 font-bold text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Not Run">Not Run</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'techniques' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              1. Boundary Value Analysis (BVA) — Room Capacity Boundaries
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Where room desk capacity is represented as <code className="text-blue-600 font-mono">C</code>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-blue-600 font-bold text-sm block">Boundary: C - 1 Seats</span>
                <span className="text-slate-900 font-bold block mt-1">Under Capacity</span>
                <p className="text-slate-500 mt-2">
                  System comfortably allocates seats. Room occupancy remains at <strong>(C - 1) / C</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-mono text-emerald-700 font-bold text-sm block">Boundary: C Seats (Exact)</span>
                <span className="text-emerald-900 font-bold block mt-1">Full Room Capacity</span>
                <p className="text-emerald-800 mt-2">
                  Room reached 100% capacity. Seating engine locks room and redirects student #C+1 to next available hall.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="font-mono text-rose-700 font-bold text-sm block">Boundary: C + 1 Seats</span>
                <span className="text-rose-900 font-bold block mt-1">Over Capacity Overflow</span>
                <p className="text-rose-800 mt-2">
                  System rejects allocating seat #C+1 in current room. Prevents desk overbooking.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
