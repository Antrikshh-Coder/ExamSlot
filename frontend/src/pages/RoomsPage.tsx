import React, { useState } from 'react';
import { Room } from '../types';
import { Building, Plus, Trash2, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

interface Props {
  rooms: Room[];
  onAdd: (room: any) => Promise<void>;
  onDelete: (number: string) => Promise<void>;
}

export const RoomsPage: React.FC<Props> = ({ rooms, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    building: 'Main Academic Block',
    floor: 1,
    capacity: 60,
    status: 'Active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.status === 'Active' ? r.capacity : 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number) {
      showToast('Please enter a room number', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      showToast(`Examination hall ${formData.room_number} added successfully`, 'success');
      setIsModalOpen(false);
      setFormData({ room_number: '', building: 'Main Academic Block', floor: 1, capacity: 60, status: 'Active' });
    } catch (err: any) {
      showToast(`Failed to add room: ${err.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (num: string) => {
    try {
      await onDelete(num);
      showToast(`Room record ${num} removed`, 'warning');
    } catch (err: any) {
      showToast(`Failed to delete room: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Rooms & Capacity"
        subtitle={`Configured Examination Halls: ${rooms.length} Rooms • Total Capacity: ${totalCapacity} seats per slot`}
        breadcrumbs={[{ label: 'Examination' }, { label: 'Rooms' }]}
        icon={<Building className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Examination Room
          </Button>
        }
      />

      {/* Demo Data Tag */}
      <Card className="p-4 bg-amber-50/60 border-amber-200 text-xs text-amber-900 flex items-center gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong className="font-bold">Capacity Enforcement:</strong> Room capacities listed below strictly constrain the sequential seating allocation engine to satisfy AC-02.
        </div>
      </Card>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map(room => (
          <Card key={room.room_number} hoverEffect className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  {room.room_number}
                </span>
                <StatusBadge status={room.status} variant={room.status === 'Active' ? 'success' : 'neutral'} size="sm" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs mt-3">{room.building}</h4>
              <p className="text-[11px] text-slate-500">Floor level {room.floor}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block font-semibold">DESK CAPACITY</span>
                <strong className="text-xl font-black text-blue-600">{room.capacity} Seats</strong>
              </div>

              <button
                onClick={() => handleDelete(room.room_number)}
                className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete Room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Examination Hall"
        description="Define room number, building, floor level, and desk capacity."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-room-form"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save Hall Record
            </Button>
          </>
        }
      >
        <form id="add-room-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Room Number (e.g. A-103)"
            required
            value={formData.room_number}
            onChange={e => setFormData({ ...formData, room_number: e.target.value })}
          />
          <Input
            label="Building Block Name"
            required
            value={formData.building}
            onChange={e => setFormData({ ...formData, building: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Floor Level"
              type="number"
              min={0}
              max={10}
              value={formData.floor}
              onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value, 10) })}
            />
            <Input
              label="Seat Capacity"
              type="number"
              min={1}
              max={200}
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
