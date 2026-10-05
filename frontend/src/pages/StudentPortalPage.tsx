import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import { GraduationCap, Printer, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

interface Props {
  students: Student[];
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
}

export const StudentPortalPage: React.FC<Props> = ({
  students,
  selectedStudentId,
  setSelectedStudentId,
}) => {
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<any | null>(null);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadStudentData = async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getStudentHallTicket(id);
      setTicketData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Student Portal"
        subtitle="Personal Examination Timetable, Room Allocation, and Official Hall Ticket"
        breadcrumbs={[{ label: 'Student Portal' }]}
        icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
        actions={
          <div className="flex items-center gap-3 w-64">
            <Select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              options={students.map(s => ({
                value: s.student_id,
                label: `${s.student_id} - ${s.name}`,
              }))}
            />
          </div>
        }
      />

      {loading || !ticketData ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="font-semibold text-sm">Loading Student Examination Schedule...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Candidate Profile Summary */}
          <Card className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Student Name</span>
              <strong className="text-slate-900 text-base font-extrabold">{ticketData.student.name}</strong>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Roll ID Number</span>
              <strong className="text-blue-600 text-base font-mono font-bold">{ticketData.student.student_id}</strong>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Department</span>
              <strong className="text-slate-800 text-sm font-semibold">{ticketData.student.department}</strong>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Semester</span>
              <strong className="text-slate-800 text-sm font-semibold">Semester {ticketData.student.semester}</strong>
            </div>
          </Card>

          {/* Exam Schedule Table */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle>Personal Examination Schedule</CardTitle>
                <CardDescription>Showing {ticketData.examSchedule.length} enrolled courses</CardDescription>
              </div>
              <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Print Hall Ticket
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Course Code</th>
                    <th className="px-6 py-3.5">Course Title</th>
                    <th className="px-6 py-3.5">Exam Date & Slot</th>
                    <th className="px-6 py-3.5">Time Interval</th>
                    <th className="px-6 py-3.5">Allocated Room</th>
                    <th className="px-6 py-3.5">Allocated Desk #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {ticketData.examSchedule.map((ex: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{ex.course_code}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{ex.course_name}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {ex.slot_name} ({ex.slot_date})
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {ex.start_time} - {ex.end_time} ({ex.session})
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-900">{ex.room_number}</td>
                      <td className="px-6 py-4 font-mono font-black text-emerald-600 text-sm">{ex.seat_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Printable Document Sheet View */}
          <div className="printable-card bg-white text-slate-950 p-8 rounded-2xl border border-slate-300 font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                Autonomous College of Engineering & Technology
              </h1>
              <p className="text-xs font-semibold text-slate-700">Official End-Semester Examination Hall Ticket - Autumn 2026</p>
              <span className="inline-block mt-2 font-mono text-xs font-bold bg-slate-100 text-slate-900 px-3 py-1 rounded border border-slate-400">
                Hall Ticket No: {ticketData.hallTicket.hall_ticket_number}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6 border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500 font-semibold block">Student Name:</span>
                <strong className="text-slate-900 text-sm">{ticketData.student.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Student Roll ID:</span>
                <strong className="text-slate-900 text-sm font-mono">{ticketData.student.student_id}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Department:</span>
                <span className="text-slate-800 font-semibold">{ticketData.student.department}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Semester:</span>
                <span className="text-slate-800 font-semibold">Semester {ticketData.student.semester}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Allocated Schedule & Desks</h4>
            <table className="w-full text-left text-xs border-collapse border border-slate-400 mb-6">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-400">Course</th>
                  <th className="p-2 border border-slate-400">Exam Slot</th>
                  <th className="p-2 border border-slate-400">Room</th>
                  <th className="p-2 border border-slate-400">Desk / Seat</th>
                </tr>
              </thead>
              <tbody>
                {ticketData.examSchedule.map((ex: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="p-2 border border-slate-300 font-bold">{ex.course_code} - {ex.course_name}</td>
                    <td className="p-2 border border-slate-300 font-semibold">{ex.slot_name} ({ex.slot_date})</td>
                    <td className="p-2 border border-slate-300 font-bold text-blue-900">{ex.room_number}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-indigo-900">{ex.seat_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
