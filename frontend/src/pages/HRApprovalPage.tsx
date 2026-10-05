import React, { useState } from 'react';
import { DutyAllocation, HRApproval } from '../types';
import { CheckCircle2, XCircle, UserCheck, MessageSquare, History } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface Props {
  duties: DutyAllocation[];
  history: HRApproval[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}

export const HRApprovalPage: React.FC<Props> = ({ duties, history, onApprove, onReject }) => {
  const [rejectingDutyId, setRejectingDutyId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const pendingDuties = duties.filter(d => d.status === 'PENDING HR APPROVAL');
  const approvedDuties = duties.filter(d => d.status === 'HR APPROVED');

  const handleApprove = async (id: number) => {
    try {
      await onApprove(id);
      showToast(`Duty allocation #${id} approved by HR`, 'success');
    } catch (err: any) {
      showToast(`Approval error: ${err.message || err}`, 'error');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason || rejectionReason.trim() === '') {
      setErrorMsg('Mandatory Rule: Rejection reason cannot be empty.');
      showToast('Rejection reason is mandatory', 'error');
      return;
    }
    if (rejectingDutyId !== null) {
      setIsSubmitting(true);
      try {
        await onReject(rejectingDutyId, rejectionReason);
        showToast(`Duty allocation #${rejectingDutyId} rejected by HR`, 'warning');
        setRejectingDutyId(null);
        setRejectionReason('');
        setErrorMsg('');
      } catch (err: any) {
        showToast(`Rejection error: ${err.message || err}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="HR Duty Approvals"
        subtitle="Invigilator Duty Allocation Compliance Review & Sign-Off Portal"
        breadcrumbs={[{ label: 'Operations' }, { label: 'HR Approvals' }]}
        icon={<UserCheck className="w-5 h-5 text-amber-500" />}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={`${pendingDuties.length} PENDING REVIEW`} variant="warning" />
            <StatusBadge status={`${approvedDuties.length} APPROVED`} variant="success" />
          </div>
        }
      />

      {/* Pending Duty Allocations Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Pending Duty Allocations</CardTitle>
            <CardDescription>Awaiting HR compliance verification</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Duty ID</th>
                <th className="px-6 py-3.5">Invigilator</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Slot & Session</th>
                <th className="px-6 py-3.5">Assigned Hall</th>
                <th className="px-6 py-3.5 text-right">HR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {pendingDuties.map(duty => (
                <tr key={duty.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">#DUTY-{duty.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{duty.staff_name}</td>
                  <td className="px-6 py-4 text-slate-500">{duty.department}</td>
                  <td className="px-6 py-4 text-slate-700">{duty.slot_name} ({duty.slot_date})</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{duty.room_number}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(duty.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRejectingDutyId(duty.id);
                          setErrorMsg('');
                        }}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {pendingDuties.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    All duty allocations have been processed by HR.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* HR Audit History Log */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <CardTitle>HR Approval & Rejection Audit Log</CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Duty ID</th>
                <th className="px-6 py-3.5">Invigilator</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Action By</th>
                <th className="px-6 py-3.5">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600">#DUTY-{item.duty_allocation_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.staff_name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={item.action}
                      variant={item.action === 'APPROVE' ? 'success' : 'danger'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.action_by}</td>
                  <td className="px-6 py-4 text-slate-600 italic">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mandatory Rejection Reason Modal */}
      <Modal
        isOpen={rejectingDutyId !== null}
        onClose={() => setRejectingDutyId(null)}
        title="Mandatory HR Rejection Reason"
        description="HR Business Rule: Every duty rejection must specify a valid compliance or workload reason."
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectingDutyId(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="hr-rejection-form"
              variant="danger"
              isLoading={isSubmitting}
            >
              Confirm Duty Rejection
            </Button>
          </>
        }
      >
        <form id="hr-rejection-form" onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Rejection (Mandatory)
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Staff member workload exceeds maximum weekly duty allowance."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
