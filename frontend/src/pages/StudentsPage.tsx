import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Search, Trash2, User } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  students: Student[];
  onAdd: (student: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const StudentsPage: React.FC<Props> = ({ students, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 6,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.email) {
      showToast('Please fill out Student ID, Name, and Email', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      showToast(`Student ${formData.student_id} added successfully`, 'success');
      setIsModalOpen(false);
      setFormData({ student_id: '', name: '', email: '', department: 'Computer Science', semester: 6 });
    } catch (err: any) {
      showToast(`Failed to add student: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      showToast(`Student record ${id} removed`, 'warning');
    } catch (err: any) {
      showToast(`Failed to delete student: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Students Directory"
        subtitle={`Official Case Study: 7,800 students • Prototype DB: ${students.length} records`}
        breadcrumbs={[{ label: 'Examination' }, { label: 'Students' }]}
        icon={<User className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Student Record
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by ID, name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Electronics & Comm', label: 'Electronics & Comm' },
            ]}
          />
        </div>
      </Card>

      {/* Students Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Enrolled Student Records</CardTitle>
            <CardDescription>Showing {filteredStudents.length} candidate profiles</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredStudents.map(student => (
                <tr key={student.student_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{student.student_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-500">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">Semester {student.semester}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(student.student_id)}
                      className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Student Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No student records match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student Record"
        description="Register a student candidate into the examination database."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-student-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Student Record
            </Button>
          </>
        }
      >
        <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Student ID (e.g. S1013)"
            required
            value={formData.student_id}
            onChange={e => setFormData({ ...formData, student_id: e.target.value })}
          />
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Electronics & Comm', label: 'Electronics & Comm' },
            ]}
          />
          <Input
            label="Semester"
            type="number"
            min={1}
            max={8}
            value={formData.semester}
            onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
          />
        </form>
      </Modal>
    </div>
  );
};
