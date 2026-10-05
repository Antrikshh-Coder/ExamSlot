import React, { useState } from 'react';
import { TimetableEntry } from '../types';
import { Grid, Play, CheckCircle2, AlertTriangle, Clock, BookOpen, RefreshCw, Search, Download, Printer, ArrowRight, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ProgressBar } from '../components/ui/ProgressBar';

interface Props {
  timetable: TimetableEntry[];
  onGenerate: () => Promise<void>;
  onNavigateClashes: () => void;
}

const GENERATION_STEPS = [
  'Preparing examination data...',
  'Building conflict graph...',
  'Analyzing student overlaps...',
  'Assigning examination slots...',
  'Validating conflicts...',
  'Generating final timetable...',
  '✓ Timetable generated successfully',
];

export const TimetablePage: React.FC<Props> = ({ timetable, onGenerate, onNavigateClashes }) => {
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [slotFilter, setSlotFilter] = useState('ALL');

  const handleRunGeneration = async () => {
    setIsGeneratingModalOpen(true);
    setCurrentStepIndex(0);

    for (let i = 0; i < GENERATION_STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 450));
      setCurrentStepIndex(i + 1);
    }

    try {
      await onGenerate();
    } catch (err) {
      console.error('Timetable Generation Error:', err);
    }
  };

  const filteredTimetable = timetable.filter(entry => {
    const matchesSearch =
      entry.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.course_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || entry.department === departmentFilter;
    const matchesSlot = slotFilter === 'ALL' || entry.slot_name === slotFilter;
    return matchesSearch && matchesDept && matchesSlot;
  });

  const totalClashes = timetable.reduce((acc, t) => acc + t.clash_count, 0);

  const exportCSV = () => {
    const headers = ['Course Code', 'Course Name', 'Department', 'Slot', 'Date', 'Start Time', 'End Time', 'Status'];
    const rows = timetable.map(t => [
      t.course_code,
      `"${t.course_name}"`,
      t.department,
      t.slot_name,
      t.slot_date,
      t.start_time,
      t.end_time,
      t.clash_count === 0 ? 'CLASH FREE' : 'CONFLICT',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ExamSlot_Master_Timetable.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Examination Timetable"
        subtitle="Greedy Graph-Coloring Timetable Generator & Master Exam Schedule"
        breadcrumbs={[{ label: 'Examination' }, { label: 'Timetable' }]}
        icon={<Grid className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
            <Button
              variant="primary"
              onClick={handleRunGeneration}
              icon={<Play className="w-4 h-4" />}
            >
              Generate Timetable
            </Button>
          </div>
        }
      />

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            {timetable.length}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Scheduled Courses</h4>
            <p className="text-xs text-slate-500">Master examination timetable matrix</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              totalClashes === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {totalClashes}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Detected Student Clashes</h4>
            <p className="text-xs text-slate-500">
              {totalClashes === 0 ? '0 student double bookings' : 'Requires slot adjustment'}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">AC-01 Status</span>
            <div className="mt-1">
              <StatusBadge
                status={timetable.length === 0 ? 'NOT RUN' : totalClashes === 0 ? 'PASS (CLASH FREE)' : 'FAIL'}
                variant={totalClashes === 0 && timetable.length > 0 ? 'success' : 'danger'}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateClashes}
            className="text-blue-600 hover:text-blue-700"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Audit Clashes
          </Button>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search course code or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Departments' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Electronics', label: 'Electronics' },
              ]}
            />
            <Select
              value={slotFilter}
              onChange={e => setSlotFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Slots' },
                { value: 'Slot 1 - Morning', label: 'Slot 1' },
                { value: 'Slot 2 - Afternoon', label: 'Slot 2' },
                { value: 'Slot 3 - Morning', label: 'Slot 3' },
                { value: 'Slot 4 - Afternoon', label: 'Slot 4' },
                { value: 'Slot 5 - Morning', label: 'Slot 5' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Timetable Schedule Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Master Examination Timetable</CardTitle>
            <CardDescription>Showing {filteredTimetable.length} course exam entries</CardDescription>
          </div>
          <StatusBadge status="SCHEDULED" variant="info" />
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Course</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Exam Slot</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Time Window</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredTimetable.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-blue-600 block">{entry.course_code}</span>
                    <span className="font-semibold text-slate-900">{entry.course_name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{entry.department}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> {entry.slot_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{entry.slot_date}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{entry.start_time} - {entry.end_time}</td>
                  <td className="px-6 py-4">
                    {entry.clash_count === 0 ? (
                      <StatusBadge status="CLASH FREE" variant="success" size="sm" />
                    ) : (
                      <StatusBadge status={`CONFLICT (${entry.clash_count})`} variant="danger" size="sm" />
                    )}
                  </td>
                </tr>
              ))}

              {filteredTimetable.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No timetable schedule entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 17 Animated Progress Workflow Modal */}
      <Modal
        isOpen={isGeneratingModalOpen}
        onClose={() => {
          if (currentStepIndex === GENERATION_STEPS.length - 1) {
            setIsGeneratingModalOpen(false);
          }
        }}
        title="Generating Examination Timetable"
        description="Executing Welsh-Powell Heuristic Graph-Coloring Algorithm"
      >
        <div className="py-6 space-y-6">
          <ProgressBar
            progress={Math.round(((currentStepIndex + 1) / GENERATION_STEPS.length) * 100)}
            color="blue"
            size="lg"
            label="Algorithm Execution Progress"
            sublabel={`${Math.round(((currentStepIndex + 1) / GENERATION_STEPS.length) * 100)}%`}
          />

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            {GENERATION_STEPS.map((step, idx) => {
              const isPassed = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={
                      isPassed
                        ? 'text-emerald-700 font-bold'
                        : isCurrent
                        ? 'text-blue-600 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {currentStepIndex === GENERATION_STEPS.length - 1 && (
            <div className="pt-2 flex justify-end">
              <Button variant="success" onClick={() => setIsGeneratingModalOpen(false)}>
                Done & View Timetable
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
