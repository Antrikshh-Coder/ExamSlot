import React, { useState } from 'react';
import { SeatingAllocation } from '../types';
import { Award, Play, CheckCircle2, AlertTriangle, Building, RefreshCw, XCircle, User, Grid } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Select } from '../components/ui/Select';
import { ProgressBar } from '../components/ui/ProgressBar';

interface Props {
  seating: SeatingAllocation[];
  onGenerate: () => Promise<void>;
}

export const SeatingPage: React.FC<Props> = ({ seating, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');

  const handleRun = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group seating by room number
  const roomGroups: { [roomNum: string]: SeatingAllocation[] } = {};
  seating.forEach(s => {
    if (!roomGroups[s.room_number]) {
      roomGroups[s.room_number] = [];
    }
    roomGroups[s.room_number].push(s);
  });

  const roomKeys = Object.keys(roomGroups);
  const displayedRoomKeys = selectedRoom === 'ALL' ? roomKeys : roomKeys.filter(r => r === selectedRoom);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Seating Allocation"
        subtitle="Sequential Capacity-Constrained Desk Assignment Engine & Visual Seat Maps (AC-02)"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Seating Allocation' }]}
        icon={<Award className="w-5 h-5" />}
        actions={
          <Button
            variant="primary"
            onClick={handleRun}
            isLoading={isGenerating}
            icon={<Play className="w-4 h-4" />}
          >
            Run Seating Engine
          </Button>
        }
      />

      {/* Filter and Legend Controls */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-slate-500">Seat Map Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 border border-blue-700" />
            <span className="text-slate-700">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
            <span className="text-slate-500">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-amber-800">Reserved</span>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Exam Rooms' },
              ...roomKeys.map(r => ({ value: r, label: `Room ${r}` })),
            ]}
          />
        </div>
      </Card>

      {/* Room Seating Cards & Seat Grids */}
      <div className="space-y-6">
        {displayedRoomKeys.map(roomNum => {
          const seatsInRoom = roomGroups[roomNum];
          const capacity = 60; // Standard room capacity
          const allocatedCount = seatsInRoom.length;
          const progress = Math.round((allocatedCount / capacity) * 100);

          return (
            <Card key={roomNum} className="overflow-hidden">
              <CardHeader className="bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Room {roomNum}</CardTitle>
                    <CardDescription>
                      Capacity: <strong>{capacity} seats</strong> | Allocated: <strong>{allocatedCount} students</strong>
                    </CardDescription>
                  </div>
                </div>
                <div className="w-44 hidden sm:block">
                  <ProgressBar progress={progress} label="Hall Capacity" color="blue" size="sm" />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Visual Seat Map Grid (Section 18 requirement) */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Visual Desk Seat Grid Map (Room {roomNum})
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {Array.from({ length: capacity }).map((_, idx) => {
                      const seatNum = `${roomNum}-${String(idx + 1).padStart(3, '0')}`;
                      const isOccupied = idx < seatsInRoom.length;
                      const seatData = isOccupied ? seatsInRoom[idx] : null;

                      return (
                        <div
                          key={idx}
                          title={
                            isOccupied
                              ? `Seat ${seatNum}: ${seatData?.student_name} (${seatData?.student_id}) - ${seatData?.course_code}`
                              : `Seat ${seatNum}: Available`
                          }
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            isOccupied
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs hover:bg-blue-700'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-bold block">{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Allocated List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {seatsInRoom.slice(0, 12).map(seat => (
                    <div
                      key={seat.id}
                      className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between hover:border-slate-300 transition shadow-xs"
                    >
                      <div>
                        <span className="font-mono text-xs font-extrabold text-blue-600 block">{seat.seat_number}</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[130px] block mt-0.5">{seat.student_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{seat.student_id} • {seat.course_code}</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {seating.length === 0 && (
          <Card className="p-12 text-center text-slate-500">
            <Award className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-90" />
            <h3 className="font-bold text-slate-900 text-lg">No Seating Allocations Generated</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click "Run Seating Engine" above to sequentially allocate students to desks while enforcing room capacity limits.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
