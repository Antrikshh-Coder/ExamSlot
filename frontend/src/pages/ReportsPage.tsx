import React, { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('timetable');
  const [reportData, setReportData] = useState<any[]>([]);

  const reportsList = [
    { id: 'timetable', title: '1. Master Examination Timetable' },
    { id: 'clash', title: '2. Clash Audit Report' },
    { id: 'seating', title: '3. Desk Seating Allocation' },
    { id: 'workload', title: '4. Invigilator Workload' },
    { id: 'testing', title: '5. Software Test Execution' },
    { id: 'risks', title: '6. Risk Register Report' },
  ];

  const handleFetchReport = async (type: string) => {
    setSelectedReport(type);
    try {
      const data = await api.getReportData(type);
      setReportData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ExamSlot_${selectedReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Academic Reports & Export"
        subtitle="Generate and export official examination, seating, duty, QA, and project management datasets"
        breadcrumbs={[{ label: 'Quality' }, { label: 'Reports' }]}
        icon={<FileText className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Document
            </Button>
            <Button
              variant="primary"
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              Export Master CSV
            </Button>
          </div>
        }
      />

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {reportsList.map(r => (
          <button
            key={r.id}
            onClick={() => handleFetchReport(r.id)}
            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
              selectedReport === r.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* Report Data Preview Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle className="capitalize">{selectedReport} Report Data View</CardTitle>
            <CardDescription>Total Rows: {reportData.length}</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {reportData.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  {Object.keys(reportData[0]).map(key => (
                    <th key={key} className="px-6 py-3.5">{key.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="px-6 py-4 truncate max-w-xs">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a report tab above to load data view.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
