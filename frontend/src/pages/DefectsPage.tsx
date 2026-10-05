import React, { useState } from 'react';
import { Defect } from '../types';
import { ShieldAlert, Plus, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  defects: Defect[];
  onAdd: (defect: any) => Promise<void>;
}

export const DefectsPage: React.FC<Props> = ({ defects, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    defect_id: `DEF-0${defects.length + 1}`,
    title: '',
    severity: 'Medium',
    priority: 'High',
    module: 'Seating Module',
    status: 'Open',
    description: 'Prototype Demo Data: ',
    expected_result: '',
    actual_result: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Please enter a defect title', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      showToast(`Defect ${formData.defect_id} logged successfully`, 'success');
      setIsModalOpen(false);
      setFormData({
        defect_id: `DEF-0${defects.length + 2}`,
        title: '',
        severity: 'Medium',
        priority: 'High',
        module: 'Seating Module',
        status: 'Open',
        description: 'QA Logged item',
        expected_result: '',
        actual_result: '',
      });
    } catch (err: any) {
      showToast(`Failed to log defect: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Defect Tracking"
        subtitle="Software Quality Defect Register & Resolution Lifecycle"
        breadcrumbs={[{ label: 'Quality' }, { label: 'Defects' }]}
        icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
        actions={
          <Button
            variant="danger"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Log New Defect
          </Button>
        }
      />

      {/* Demo Data Notice */}
      <Card className="p-4 bg-amber-50/60 border-amber-200 text-xs text-amber-900 flex items-center gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong className="font-bold">QA Demonstration Data:</strong> Defect records listed below demonstrate software quality assurance logging procedures.
        </div>
      </Card>

      {/* Defects Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Defect Log</CardTitle>
            <CardDescription>Showing {defects.length} logged issue items</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Defect ID</th>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Module</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {defects.map(d => (
                <tr key={d.defect_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-rose-600">{d.defect_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{d.title}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={d.severity}
                      variant={d.severity === 'Critical' ? 'danger' : 'warning'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{d.priority}</td>
                  <td className="px-6 py-4 text-slate-500">{d.module}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={d.status}
                      variant={d.status === 'Closed' ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">{d.description}</td>
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
        title="Log New Defect Record"
        description="Specify defect title, module, severity, and description."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-defect-form"
              variant="danger"
              isLoading={isSubmitting}
            >
              Save Defect
            </Button>
          </>
        }
      >
        <form id="add-defect-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Defect Title"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Severity"
              value={formData.severity}
              onChange={e => setFormData({ ...formData, severity: e.target.value })}
              options={[
                { value: 'Critical', label: 'Critical' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
