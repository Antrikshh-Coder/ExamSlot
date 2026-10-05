import React, { useState } from 'react';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export const UMLDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'usecase' | 'class' | 'activity' | 'seq_timetable' | 'seq_ticket' | 'state_duty'>('usecase');

  const useCaseDiagram = `
  gantt
    title System Use Cases
    section Examination Cell
    Manage Students & Courses : active, uc1, 2026-10-01, 5d
    Generate Timetable (Graph Coloring) : uc2, after uc1, 5d
    Allocate Seating Capacity : uc3, after uc2, 5d
    section HR Department
    Review Invigilator Workload : uc4, after uc3, 5d
    Approve / Reject Duty Allocation : uc5, after uc4, 5d
  `;

  const classDiagram = `
  classDiagram
    class Student {
      +String student_id
      +String name
      +String email
      +String department
      +int semester
    }
    class Course {
      +String course_code
      +String course_name
      +String department
      +int semester
      +int credits
    }
    class ExamSlot {
      +int id
      +String name
      +String slot_date
      +String session
    }
    class Room {
      +String room_number
      +int capacity
      +String status
    }
    class Timetable {
      +String course_code
      +int slot_id
      +int clash_count
    }
    class SeatingAllocation {
      +String student_id
      +String room_number
      +String seat_number
    }
    class Invigilator {
      +String staff_id
      +String name
      +int max_duties
      +int current_duties
    }
    class DutyAllocation {
      +String staff_id
      +String room_number
      +String status
    }

    Student "1" -- "*" Course : student_courses
    Course "1" -- "1" Timetable : assigned_to
    ExamSlot "1" -- "*" Timetable : contains
    Timetable "1" -- "*" SeatingAllocation : allocates
    Room "1" -- "*" SeatingAllocation : holds
    Invigilator "1" -- "*" DutyAllocation : assigned
    Room "1" -- "*" DutyAllocation : invigilated
  `;

  const activityDiagram = `
  stateDiagram-v2
    [*] --> LoadRegistrations
    LoadRegistrations --> BuildConflictGraph
    BuildConflictGraph --> WelshPowellColoring
    WelshPowellColoring --> CheckConflicts
    state CheckConflicts {
      [*] --> ZeroClash
      ZeroClash --> SaveTimetable
    }
    SaveTimetable --> ExecuteSeatingAllocation
    ExecuteSeatingAllocation --> GenerateHallTickets
    GenerateHallTickets --> [*]
  `;

  const seqTimetableDiagram = `
  sequenceDiagram
    autonumber
    actor Admin as Exam Cell
    participant API as REST API (/api/timetable/generate)
    participant Engine as Timetable Engine (Graph Coloring)
    participant DB as SQLite Database

    Admin->>API: POST /api/timetable/generate
    API->>DB: Fetch courses, exam slots & student_courses
    DB-->>API: Data Arrays
    API->>Engine: Run Welsh-Powell Graph Coloring
    Engine->>Engine: Build conflict adjacency list
    Engine->>Engine: Assign non-overlapping slots
    Engine->>DB: Save generated timetable
    DB-->>API: Success Response
    API-->>Admin: { clashesCount: 0, status: PASS }
  `;

  const seqTicketDiagram = `
  sequenceDiagram
    autonumber
    actor Admin as Exam Cell / Controller
    participant API as REST API (/api/hall-tickets/publish)
    participant Engine as AC-03 Validator
    participant DB as SQLite Database

    Admin->>API: POST /api/hall-tickets/generate
    API->>DB: Fetch exam_start_date & publish_date
    DB-->>API: Date Config
    API->>Engine: Check (ExamDate - PublishDate) >= 10 Days
    alt Difference >= 10 Days
      Engine-->>API: AC-03 Status = PASS
      API->>DB: Update hall_tickets status = 'Published'
    else Difference < 10 Days
      Engine-->>API: AC-03 Status = FAIL
    end
    API-->>Admin: Live Status Result
  `;

  const stateDutyDiagram = `
  stateDiagram-v2
    [*] --> DRAFT : System Allocates Duty
    DRAFT --> GENERATED : Exam Cell Submits
    GENERATED --> PENDING_HR_APPROVAL : Sent to HR
    PENDING_HR_APPROVAL --> HR_APPROVED : HR Clicks Approve
    PENDING_HR_APPROVAL --> REJECTED : HR Rejects (Requires Reason)
    REJECTED --> DRAFT : Sent back for revision
    HR_APPROVED --> FINALIZED : Controller Sign-Off
    FINALIZED --> [*]
  `;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="UML System Architecture"
        subtitle="Standard Unified Modeling Language (UML) Structural, Behavioral & Sequence Diagrams"
        breadcrumbs={[{ label: 'Project' }, { label: 'UML Diagrams' }]}
        icon={<Sparkles className="w-5 h-5 text-blue-600" />}
      />

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Button
          variant={activeTab === 'usecase' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('usecase')}
        >
          Use Case
        </Button>
        <Button
          variant={activeTab === 'class' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('class')}
        >
          Class Diagram
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('activity')}
        >
          Activity Diagram
        </Button>
        <Button
          variant={activeTab === 'seq_timetable' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('seq_timetable')}
        >
          Seq: Timetable
        </Button>
        <Button
          variant={activeTab === 'seq_ticket' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('seq_ticket')}
        >
          Seq: Hall Ticket
        </Button>
        <Button
          variant={activeTab === 'state_duty' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('state_duty')}
        >
          State: HR Approval
        </Button>
      </div>

      {/* Render Active Diagram */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <div>
            <CardTitle className="capitalize">UML {activeTab.replace('_', ' ')} Diagram</CardTitle>
            <CardDescription>Interactive architectural Mermaid diagram visualization</CardDescription>
          </div>
        </CardHeader>

        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {activeTab === 'usecase' && <MermaidDiagram id="uml-usecase" chart={useCaseDiagram} />}
          {activeTab === 'class' && <MermaidDiagram id="uml-class" chart={classDiagram} />}
          {activeTab === 'activity' && <MermaidDiagram id="uml-activity" chart={activityDiagram} />}
          {activeTab === 'seq_timetable' && <MermaidDiagram id="uml-seq-tt" chart={seqTimetableDiagram} />}
          {activeTab === 'seq_ticket' && <MermaidDiagram id="uml-seq-ticket" chart={seqTicketDiagram} />}
          {activeTab === 'state_duty' && <MermaidDiagram id="uml-state-duty" chart={stateDutyDiagram} />}
        </div>
      </Card>
    </div>
  );
};
