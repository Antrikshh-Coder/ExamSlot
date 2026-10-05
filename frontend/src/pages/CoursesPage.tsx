import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Plus, Search, Trash2, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  courses: Course[];
  onAdd: (course: any) => Promise<void>;
  onDelete: (code: string) => Promise<void>;
}

export const CoursesPage: React.FC<Props> = ({ courses, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    department: 'Computer Science',
    semester: 6,
    credits: 4,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const filteredCourses = courses.filter(c => {
    const matchesSearch =
      c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || c.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_code || !formData.course_name) {
      showToast('Please enter course code and course title', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      showToast(`Course ${formData.course_code} added successfully`, 'success');
      setIsModalOpen(false);
      setFormData({ course_code: '', course_name: '', department: 'Computer Science', semester: 6, credits: 4 });
    } catch (err: any) {
      showToast(`Failed to add course: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await onDelete(code);
      showToast(`Course ${code} removed successfully`, 'warning');
    } catch (err: any) {
      showToast(`Failed to delete course: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Courses Catalog"
        subtitle={`Official Case Study: 64 Curriculum Courses • Active Database: ${courses.length} Courses Populated`}
        breadcrumbs={[{ label: 'Examination' }, { label: 'Courses' }]}
        icon={<BookOpen className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Course
          </Button>
        }
      />

      {/* Official Case Study Notice */}
      <Card className="p-4 bg-blue-50/60 border-blue-200 text-xs text-blue-900 flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <strong className="font-bold">Complete Curriculum Coverage:</strong> All <strong>64+ official courses</strong> across Computer Science, Information Technology, Electronics & Communication, Mechanical, and Civil Engineering departments are now populated in the database.
        </div>
      </Card>

      {/* Search and Department Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search course code or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Departments' },
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Electronics & Comm', label: 'Electronics & Comm' },
              { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
              { value: 'Civil Engineering', label: 'Civil Engineering' },
            ]}
          />
        </div>
      </Card>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.course_code} hoverEffect className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                  {course.course_code}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Sem {course.semester} • {course.credits} Credits
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{course.course_name}</h3>
              <p className="text-xs text-slate-500 mt-1">{course.department}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Status: <strong className="text-slate-700">Scheduled</strong></span>
              <button
                onClick={() => handleDelete(course.course_code)}
                className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Course Record"
        description="Define course code, title, credits, and department."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-course-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Course Record
            </Button>
          </>
        }
      >
        <form id="add-course-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Code (e.g. CS305)"
            required
            value={formData.course_code}
            onChange={e => setFormData({ ...formData, course_code: e.target.value })}
          />
          <Input
            label="Course Title"
            required
            value={formData.course_name}
            onChange={e => setFormData({ ...formData, course_name: e.target.value })}
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Electronics & Comm', label: 'Electronics & Comm' },
              { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
              { value: 'Civil Engineering', label: 'Civil Engineering' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Semester"
              type="number"
              min={1}
              max={8}
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
            />
            <Input
              label="Credits"
              type="number"
              min={1}
              max={6}
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value, 10) })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
