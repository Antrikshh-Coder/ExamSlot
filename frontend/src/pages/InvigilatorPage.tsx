import React, { useState } from 'react';
import { Invigilator, DutyAllocation } from '../types';
import { UserCheck, Plus, Play, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  invigilators: Invigilator[];
  duties: DutyAllocation[];
  onAddInvigilator: (inv: any) => Promise<void>;
  onGenerateDuties: () => Promise<void>;
}

export const InvigilatorPage: React.FC<Props> = ({
  invigilators,
  duties,
  onAddInvigilator,
  onGenerateDuties,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    department: 'Computer Science',
    max_duties: 4,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateDuties();
      showToast('Faculty duty allocations generated successfully', 'success');
    } catch (err: any) {
      showToast(`Duty generation error: ${err.message || err}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id || !formData.name) {
      showToast('Please enter Staff ID and Full Name', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddInvigilator(formData);
      showToast(`Invigilator ${formData.name} added to staff pool`, 'success');
      setIsModalOpen(false);
      setFormData({ staff_id: '', name: '', department: 'Computer Science', max_duties: 4 });
    } catch (err: any) {
      showToast(`Failed to add invigilator: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Invigilator Management"
        subtitle="Staff Workload Balance Engine & Duty Allocation Draft Generator"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Invigilators' }]}
        icon={<UserCheck className="w-5 h-5 text-amber-500" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Staff Member
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              isLoading={isGenerating}
              icon={<Play className="w-4 h-4" />}
            >
              Generate Duty Drafts
            </Button>
          </div>
        }
      />

      {/* Staff Workload Cards Grid */}
      <div>
        <h3 className="font-bold text-slate-900 text-base mb-4">Faculty Workload Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {invigilators.map(inv => {
            const pct = Math.min(100, Math.round((inv.current_duties / inv.max_duties) * 100));
            return (
              <Card key={inv.staff_id} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {inv.staff_id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{inv.department}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{inv.name}</h4>

                  <div className="mt-4">
                    <ProgressBar
                      progress={pct}
                      label="Duty Allocation"
                      sublabel={`${inv.current_duties} / ${inv.max_duties} max`}
                      color={pct >= 100 ? 'amber' : 'blue'}
                      size="sm"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Duties List Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Allocated Duty Assignments</CardTitle>
            <CardDescription>Showing {duties.length} invigilator room duty drafts</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Duty ID</th>
                <th className="px-6 py-3.5">Invigilator</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Exam Slot & Day</th>
                <th className="px-6 py-3.5">Assigned Room</th>
                <th className="px-6 py-3.5">Workflow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {duties.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">#DUTY-{d.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{d.staff_name}</td>
                  <td className="px-6 py-4 text-slate-500">{d.department}</td>
                  <td className="px-6 py-4 text-slate-700">{d.slot_name} ({d.slot_date})</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{d.room_number}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={d.status}
                      variant={
                        d.status === 'HR APPROVED'
                          ? 'success'
                          : d.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Invigilator Staff"
        description="Register a faculty invigilator into the duty pool."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-invigilator-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Invigilator
            </Button>
          </>
        }
      >
        <form id="add-invigilator-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff ID (e.g. FAC-06)"
            required
            value={formData.staff_id}
            onChange={e => setFormData({ ...formData, staff_id: e.target.value })}
          />
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Electronics & Comm', label: 'Electronics & Comm' },
              { value: 'Basic Sciences', label: 'Basic Sciences' },
            ]}
          />
          <Input
            label="Max Duties Allowance"
            type="number"
            min={1}
            max={10}
            value={formData.max_duties}
            onChange={e => setFormData({ ...formData, max_duties: parseInt(e.target.value, 10) })}
          />
        </form>
      </Modal>
    </div>
  );
};
