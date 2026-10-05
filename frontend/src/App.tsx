import React, { useEffect, useState } from 'react';
import { UserRole, DashboardData, Student, Course, Registration, ExamSlot, Room, TimetableEntry, SeatingAllocation, HallTicket, Invigilator, DutyAllocation, HRApproval, TestCase, Defect } from './types';
import { api } from './services/api';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { ExamSlotsPage } from './pages/ExamSlotsPage';
import { RoomsPage } from './pages/RoomsPage';
import { TimetablePage } from './pages/TimetablePage';
import { ClashDetectionPage } from './pages/ClashDetectionPage';
import { SeatingPage } from './pages/SeatingPage';
import { HallTicketsPage } from './pages/HallTicketsPage';
import { InvigilatorPage } from './pages/InvigilatorPage';
import { HRApprovalPage } from './pages/HRApprovalPage';
import { TestingPage } from './pages/TestingPage';
import { DefectsPage } from './pages/DefectsPage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { RiskManagementPage } from './pages/RiskManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { UMLDocsPage } from './pages/UMLDocsPage';
import { StudentPortalPage } from './pages/StudentPortalPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastProvider, useToast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [seating, setSeating] = useState<SeatingAllocation[]>([]);
  const [hallTickets, setHallTickets] = useState<HallTicket[]>([]);
  const [invigilators, setInvigilators] = useState<Invigilator[]>([]);
  const [duties, setDuties] = useState<DutyAllocation[]>([]);
  const [hrHistory, setHrHistory] = useState<HRApproval[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [config, setConfig] = useState<{ exam_start_date?: string; hall_ticket_publish_date?: string }>({});

  const [selectedStudentId, setSelectedStudentId] = useState<string>('S1001');
  const { showToast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        dashRes,
        stdRes,
        crsRes,
        regRes,
        sltRes,
        rmRes,
        ttRes,
        stRes,
        htRes,
        invRes,
        dtRes,
        hrRes,
        tcRes,
        dfRes,
        cfgRes,
      ] = await Promise.all([
        api.getDashboard(),
        api.getStudents(),
        api.getCourses(),
        api.getRegistrations(),
        api.getSlots(),
        api.getRooms(),
        api.getTimetable(),
        api.getSeating(),
        api.getHallTickets(),
        api.getInvigilators(),
        api.getDuties(),
        api.getHRHistory(),
        api.getTestCases(),
        api.getDefects(),
        api.getConfig(),
      ]);

      setDashboardData(dashRes);
      setStudents(stdRes);
      setCourses(crsRes);
      setRegistrations(regRes);
      setSlots(sltRes);
      setRooms(rmRes);
      setTimetable(ttRes);
      setSeating(stRes);
      setHallTickets(htRes);
      setInvigilators(invRes);
      setDuties(dtRes);
      setHrHistory(hrRes);
      setTestCases(tcRes);
      setDefects(dfRes);
      setConfig(cfgRes);

      if (stdRes.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stdRes[0].student_id);
      }
    } catch (err) {
      console.error('Data load error:', err);
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'Student') {
      setActiveTab('student-portal');
    } else if (role === 'HR') {
      setActiveTab('hr-approvals');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched to ${role} Portal`, 'info');
  };

  if (!activeRole) {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans">
      {/* Sidebar */}
      <Sidebar
        activeRole={activeRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => {
          setActiveRole(null);
          showToast('Logged out of workspace session', 'info');
        }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        courseCount={courses.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          activeRole={activeRole}
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          onRefresh={async () => {
            await loadAllData();
            showToast('System data refreshed successfully', 'success');
          }}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onSelectRole={handleSelectRole}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              data={dashboardData}
              onNavigate={setActiveTab}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              students={students}
              onAdd={async s => {
                await api.createStudent(s);
                await loadAllData();
                showToast('Student record added successfully', 'success');
              }}
              onDelete={async id => {
                await api.deleteStudent(id);
                await loadAllData();
                showToast('Student record deleted', 'warning');
              }}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesPage
              courses={courses}
              onAdd={async c => {
                await api.createCourse(c);
                await loadAllData();
                showToast('New course added to curriculum', 'success');
              }}
              onDelete={async code => {
                await api.deleteCourse(code);
                await loadAllData();
                showToast('Course record deleted', 'warning');
              }}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationsPage
              registrations={registrations}
              students={students}
              courses={courses}
              onAdd={async r => {
                await api.createRegistration(r);
                await loadAllData();
                showToast('Course registered for student', 'success');
              }}
              onDelete={async (sid, ccode) => {
                await api.deleteRegistration(sid, ccode);
                await loadAllData();
                showToast('Registration mapping removed', 'warning');
              }}
            />
          )}

          {activeTab === 'slots' && (
            <ExamSlotsPage
              slots={slots}
              examStartDate={config.exam_start_date || 'Fixed Examination Date — To Be Provided'}
              publishDate={config.hall_ticket_publish_date || '2026-11-01'}
              onAddSlot={async sl => {
                await api.createSlot(sl);
                await loadAllData();
                showToast('Exam slot created', 'success');
              }}
              onDeleteSlot={async id => {
                await api.deleteSlot(id);
                await loadAllData();
                showToast('Exam slot deleted', 'warning');
              }}
              onUpdateConfig={async cfg => {
                await api.updateConfig(cfg);
                await loadAllData();
                showToast('Fixed examination dates updated', 'success');
              }}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsPage
              rooms={rooms}
              onAdd={async rm => {
                await api.createRoom(rm);
                await loadAllData();
                showToast('Examination hall added', 'success');
              }}
              onDelete={async num => {
                await api.deleteRoom(num);
                await loadAllData();
                showToast('Room record deleted', 'warning');
              }}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetablePage
              timetable={timetable}
              onGenerate={async () => {
                await api.generateTimetable();
                await loadAllData();
                showToast('Timetable generated via Graph-Coloring algorithm', 'success');
              }}
              onNavigateClashes={() => setActiveTab('clashes')}
            />
          )}

          {activeTab === 'clashes' && <ClashDetectionPage />}

          {activeTab === 'seating' && (
            <SeatingPage
              seating={seating}
              onGenerate={async () => {
                await api.generateSeating();
                await loadAllData();
                showToast('Sequential seating capacity allocation complete', 'success');
              }}
            />
          )}

          {activeTab === 'halltickets' && (
            <HallTicketsPage
              tickets={hallTickets}
              examStartDate={config.exam_start_date || 'Fixed Examination Date — To Be Provided'}
              publishDate={config.hall_ticket_publish_date || '2026-11-01'}
              onGenerate={async () => {
                await api.generateHallTickets();
                await loadAllData();
                showToast('Hall tickets generated and published', 'success');
              }}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'invigilators' && (
            <InvigilatorPage
              invigilators={invigilators}
              duties={duties}
              onAddInvigilator={async inv => {
                await api.createInvigilator(inv);
                await loadAllData();
                showToast('Invigilator staff member added', 'success');
              }}
              onGenerateDuties={async () => {
                await api.generateDuties();
                await loadAllData();
                showToast('Duty allocation drafts generated', 'info');
              }}
            />
          )}

          {activeTab === 'hr-approvals' && (
            <HRApprovalPage
              duties={duties}
              history={hrHistory}
              onApprove={async id => {
                await api.approveDuty(id, `${activeRole} Admin`);
                await loadAllData();
                showToast('Invigilator duty approved by HR', 'success');
              }}
              onReject={async (id, reason) => {
                await api.rejectDuty(id, reason, `${activeRole} Admin`);
                await loadAllData();
                showToast('Invigilator duty rejected with reason', 'warning');
              }}
            />
          )}

          {activeTab === 'testing' && (
            <TestingPage
              testCases={testCases}
              onUpdateTestCase={async (id, status, actual) => {
                await api.updateTestCase(id, { actual_result: actual, status });
                await loadAllData();
                showToast(`Test case ${id} updated to ${status}`, 'info');
              }}
            />
          )}

          {activeTab === 'defects' && (
            <DefectsPage
              defects={defects}
              onAdd={async df => {
                await api.createDefect(df);
                await loadAllData();
                showToast('New defect logged', 'warning');
              }}
            />
          )}

          {activeTab === 'pm' && <ProjectManagementPage />}

          {activeTab === 'risks' && <RiskManagementPage />}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'uml' && <UMLDocsPage />}

          {activeTab === 'student-portal' && (
            <StudentPortalPage
              students={students}
              selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
