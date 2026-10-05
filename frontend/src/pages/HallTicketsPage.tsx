import React, { useState } from 'react';
import { HallTicket } from '../types';
import { FileText, Printer, Eye, AlertCircle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';

interface Props {
  tickets: HallTicket[];
  examStartDate: string;
  publishDate: string;
  onGenerate: () => Promise<void>;
  onRefresh: () => void;
}

export const HallTicketsPage: React.FC<Props> = ({
  tickets,
  examStartDate,
  publishDate,
  onGenerate,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);

  // AC-03 Days calculation
  let daysDiff: number | null = null;
  let isAc3Pass = false;

  if (examStartDate && !examStartDate.includes('To Be Provided')) {
    const eDate = new Date(examStartDate);
    const pDate = new Date(publishDate || new Date().toISOString().split('T')[0]);
    daysDiff = Math.ceil((eDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 10) isAc3Pass = true;
  }

  const handlePreview = async (studentId: string) => {
    setSelectedStudentId(studentId);
    try {
      const data = await api.getStudentHallTicket(studentId);
      setTicketDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Hall Tickets Management"
        subtitle="Automated Hall Ticket Publication & Publication Lead-Time Rule (AC-03)"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Hall Tickets' }]}
        icon={<FileText className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={onGenerate}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Generate & Publish Tickets
          </Button>
        }
      />

      {/* AC-03 Rule Banner */}
      <Card
        className={`p-6 border-l-4 ${
          isAc3Pass ? 'border-l-emerald-600 bg-emerald-50/50' : 'border-l-amber-500 bg-amber-50/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isAc3Pass ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Criterion AC-03 Status
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {isAc3Pass
                  ? `PASS — Published ${daysDiff} Days Before First Exam (≥10 Days Required)`
                  : examStartDate.includes('To Be Provided')
                  ? 'UNCONFIGURED — Exam date not set'
                  : `FAIL — Published only ${daysDiff} days before exam (<10 Days)`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                First Exam Date: <strong>{examStartDate}</strong> | Publish Date: <strong>{publishDate}</strong>
              </p>
            </div>
          </div>
          <StatusBadge status={isAc3Pass ? 'AC-03 PASS' : 'AC-03 PENDING'} variant={isAc3Pass ? 'success' : 'warning'} />
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Published Hall Tickets</CardTitle>
            <CardDescription>Showing {tickets.length} student hall tickets</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Hall Ticket #</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Publish Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {tickets.map(t => (
                <tr key={t.hall_ticket_number} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.hall_ticket_number}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{t.student_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{t.student_name}</td>
                  <td className="px-6 py-4 text-slate-500">{t.department}</td>
                  <td className="px-6 py-4 text-slate-600">{t.publish_date}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(t.student_id)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview & Print
                    </Button>
                  </td>
                </tr>
              ))}

              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hall tickets published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hall Ticket Printable Preview Modal */}
      {selectedStudentId && ticketDetails && (
        <Modal
          isOpen={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          title="Official Hall Ticket Document"
          description="Printable candidate hall ticket with seating allocations"
          maxWidth="2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedStudentId(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Document
              </Button>
            </>
          }
        >
          <div className="printable-card bg-white text-slate-950 p-6 rounded-xl border border-slate-300 font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-lg font-extrabold uppercase tracking-tight text-slate-900">
                Autonomous College of Engineering & Technology
              </h1>
              <p className="text-xs font-semibold text-slate-700">Official End-Semester Examination Hall Ticket - Autumn 2026</p>
              <span className="inline-block mt-2 font-mono text-xs font-bold bg-slate-100 text-slate-900 px-3 py-1 rounded border border-slate-400">
                Hall Ticket No: {ticketDetails.hallTicket.hall_ticket_number}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6 border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500 font-semibold block">Student Name:</span>
                <strong className="text-slate-900 text-sm">{ticketDetails.student.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Student Roll ID:</span>
                <strong className="text-slate-900 text-sm font-mono">{ticketDetails.student.student_id}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Department:</span>
                <span className="text-slate-800 font-semibold">{ticketDetails.student.department}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Semester:</span>
                <span className="text-slate-800 font-semibold">Semester {ticketDetails.student.semester}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Allocated Schedule & Desks</h4>
            <table className="w-full text-left text-xs border-collapse border border-slate-400 mb-6">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-400">Course</th>
                  <th className="p-2 border border-slate-400">Exam Slot</th>
                  <th className="p-2 border border-slate-400">Room</th>
                  <th className="p-2 border border-slate-400">Seat</th>
                </tr>
              </thead>
              <tbody>
                {ticketDetails.examSchedule.map((ex: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="p-2 border border-slate-300 font-bold">{ex.course_code} - {ex.course_name}</td>
                    <td className="p-2 border border-slate-300">{ex.slot_name} ({ex.slot_date})</td>
                    <td className="p-2 border border-slate-300 font-bold text-blue-900">{ex.room_number}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-indigo-900">{ex.seat_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
