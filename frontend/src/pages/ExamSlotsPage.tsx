import React, { useState } from 'react';
import { ExamSlot } from '../types';
import { Calendar, Plus, Trash2, Clock, AlertCircle, Save, Check } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';

interface Props {
  slots: ExamSlot[];
  examStartDate: string;
  publishDate: string;
  onAddSlot: (slot: any) => Promise<void>;
  onDeleteSlot: (id: number) => Promise<void>;
  onUpdateConfig: (config: { exam_start_date?: string; hall_ticket_publish_date?: string }) => Promise<void>;
}

export const ExamSlotsPage: React.FC<Props> = ({
  slots,
  examStartDate,
  publishDate,
  onAddSlot,
  onDeleteSlot,
  onUpdateConfig,
}) => {
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    name: '',
    slot_date: 'Day 1 (2026-11-15)',
    start_time: '09:30 AM',
    end_time: '12:30 PM',
    session: 'Morning',
  });

  const [inputExamDate, setInputExamDate] = useState(
    examStartDate.includes('To Be Provided') ? '2026-11-15' : examStartDate
  );
  const [inputPublishDate, setInputPublishDate] = useState(publishDate || '2026-11-01');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateConfig({
        exam_start_date: inputExamDate,
        hall_ticket_publish_date: inputPublishDate,
      });
      setIsSaved(true);
      showToast('Official examination dates updated', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      showToast(`Config error: ${err.message}`, 'error');
    }
  };

  const handleAddSlotSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newSlot.name || !newSlot.name.trim()) {
      showToast('Please enter a slot name', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddSlot(newSlot);
      setIsSlotModalOpen(false);
      setNewSlot({ name: '', slot_date: 'Day 1 (2026-11-15)', start_time: '09:30 AM', end_time: '12:30 PM', session: 'Morning' });
      showToast('New exam slot created successfully', 'success');
    } catch (err: any) {
      showToast(`Error creating slot: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Exam Slots"
        subtitle="Configure and manage examination sessions, dates, and session time windows."
        breadcrumbs={[{ label: 'Examination' }, { label: 'Exam Slots' }]}
        icon={<Calendar className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={() => setIsSlotModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Exam Slot
          </Button>
        }
      />

      {/* Official Exam Date Configuration Card */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Official Examination Date Configuration (AC-03 Rule)
            </CardTitle>
            <CardDescription>
              Set official examination start date and target hall ticket publish date for AC-03 lead-time verification.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfigSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="Fixed Examination Start Date"
              type="date"
              required
              value={inputExamDate}
              onChange={e => setInputExamDate(e.target.value)}
            />
            <Input
              label="Hall Ticket Target Publish Date"
              type="date"
              required
              value={inputPublishDate}
              onChange={e => setInputPublishDate(e.target.value)}
            />
            <Button
              type="submit"
              variant={isSaved ? 'success' : 'primary'}
              className="w-full"
              icon={isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
              {isSaved ? 'Saved & Verified' : 'Save Fixed Dates'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Exam Slots Cards Grid Showcase */}
      <div>
        <h3 className="font-bold text-slate-900 text-base mb-4">Exam Session Cards View</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map(slot => (
            <Card key={slot.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    SLOT 0{slot.id}
                  </span>
                  <StatusBadge status="CONFIGURED" variant="configured" size="sm" />
                </div>

                <h4 className="font-bold text-slate-900 text-lg">{slot.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{slot.slot_date}</p>

                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time Interval:</span>
                    <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Session Window:</span>
                    <span className="font-bold text-slate-800">{slot.session} Session</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Scheduled Courses: <strong className="text-slate-700">Active</strong></span>
                <button
                  onClick={async () => {
                    await onDeleteSlot(slot.id);
                    showToast('Slot removed', 'warning');
                  }}
                  className="text-rose-600 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded transition cursor-pointer"
                  title="Remove Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Create Examination Slot"
        description="Define date, time interval, and session type for the new examination slot."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-slot-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create Slot
            </Button>
          </>
        }
      >
        <form id="create-slot-form" onSubmit={handleAddSlotSubmit} className="space-y-4">
          <Input
            label="Slot Name"
            placeholder="e.g. Slot 6 - Morning Session"
            required
            value={newSlot.name}
            onChange={e => setNewSlot({ ...newSlot, name: e.target.value })}
          />
          <Input
            label="Slot Day / Date Tag"
            placeholder="e.g. Day 6 (2026-11-20)"
            required
            value={newSlot.slot_date}
            onChange={e => setNewSlot({ ...newSlot, slot_date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              placeholder="09:30 AM"
              required
              value={newSlot.start_time}
              onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}
            />
            <Input
              label="End Time"
              placeholder="12:30 PM"
              required
              value={newSlot.end_time}
              onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })}
            />
          </div>
          <Select
            label="Session Type"
            value={newSlot.session}
            onChange={e => setNewSlot({ ...newSlot, session: e.target.value })}
            options={[
              { value: 'Morning', label: 'Morning Session' },
              { value: 'Afternoon', label: 'Afternoon Session' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
