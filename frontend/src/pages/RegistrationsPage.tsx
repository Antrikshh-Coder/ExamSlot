import React, { useState } from 'react';
import { Registration, Student, Course } from '../types';
import { Layers, Plus, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  registrations: Registration[];
  students: Student[];
  courses: Course[];
  onAdd: (reg: { student_id: string; course_code: string }) => Promise<void>;
  onDelete: (student_id: string, course_code: string) => Promise<void>;
}

export const RegistrationsPage: React.FC<Props> = ({
  registrations,
  students,
  courses,
  onAdd,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const filtered = registrations.filter(
    r =>
      r.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) {
      showToast('Please select both a student and a course', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd({ student_id: selectedStudent, course_code: selectedCourse });
      showToast('Course registered for student successfully', 'success');
      setIsModalOpen(false);
      setSelectedStudent('');
      setSelectedCourse('');
    } catch (err: any) {
      showToast(`Failed to register course: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sid: string, ccode: string) => {
    try {
      await onDelete(sid, ccode);
      showToast(`Registration mapping removed for ${sid}`, 'warning');
    } catch (err: any) {
      showToast(`Failed to remove registration: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Student-Course Registrations"
        subtitle="Mapping candidate course enrollments for conflict graph analysis"
        breadcrumbs={[{ label: 'Examination' }, { label: 'Registrations' }]}
        icon={<Layers className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Register Course for Student
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search student or course..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total Mapped Enrollments: <strong className="text-slate-800">{filtered.length}</strong>
        </span>
      </Card>

      {/* Registrations Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Course Registration Mappings</CardTitle>
            <CardDescription>Input data matrix for timetable clash validation engine</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Course Code</th>
                <th className="px-6 py-3.5">Course Title</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filtered.map((reg, idx) => (
                <tr key={`${reg.student_id}-${reg.course_code}-${idx}`} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{reg.student_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{reg.student_name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-600">{reg.course_code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{reg.course_name}</td>
                  <td className="px-6 py-4 text-slate-500">{reg.department}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(reg.student_id, reg.course_code)}
                      className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove Registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Course for Student"
        description="Select a student candidate and course code to map enrollment."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="register-course-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Registration
            </Button>
          </>
        }
      >
        <form id="register-course-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Student"
            required
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            options={[
              { value: '', label: '-- Choose Student Candidate --' },
              ...students.map(s => ({
                value: s.student_id,
                label: `${s.student_id} - ${s.name} (${s.department})`,
              })),
            ]}
          />
          <Select
            label="Select Course"
            required
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            options={[
              { value: '', label: '-- Choose Course --' },
              ...courses.map(c => ({
                value: c.course_code,
                label: `${c.course_code} - ${c.course_name}`,
              })),
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
