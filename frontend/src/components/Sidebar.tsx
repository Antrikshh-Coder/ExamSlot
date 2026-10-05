import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Building,
  Grid,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  ShieldAlert,
  FolderGit2,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Sliders
} from 'lucide-react';

interface Props {
  activeRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  courseCount?: number;
}

interface NavGroup {
  groupName: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<Props> = ({
  activeRole,
  activeTab,
  setActiveTab,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  courseCount,
}) => {
  const getNavGroups = (): NavGroup[] => {
    switch (activeRole) {
      case 'ExamCell':
        return [
          {
            groupName: 'OVERVIEW',
            items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
          },
          {
            groupName: 'EXAMINATION',
            items: [
              { id: 'students', label: 'Students', icon: Users },
              { id: 'courses', label: 'Courses', icon: BookOpen, badge: courseCount !== undefined ? String(courseCount) : '65' },
              { id: 'registrations', label: 'Registrations', icon: Layers },
              { id: 'slots', label: 'Exam Slots', icon: Calendar },
              { id: 'rooms', label: 'Rooms & Capacity', icon: Building },
              { id: 'timetable', label: 'Timetable', icon: Grid },
              { id: 'clashes', label: 'Clash Detection', icon: AlertTriangle, badge: 'AC-01' },
            ],
          },
          {
            groupName: 'OPERATIONS',
            items: [
              { id: 'seating', label: 'Seating Allocation', icon: Award, badge: 'AC-02' },
              { id: 'halltickets', label: 'Hall Tickets', icon: FileText, badge: 'AC-03' },
              { id: 'invigilators', label: 'Invigilator Workload', icon: UserCheck },
            ],
          },
          {
            groupName: 'QUALITY & MANAGEMENT',
            items: [
              { id: 'testing', label: 'Testing & QA', icon: CheckSquare },
              { id: 'defects', label: 'Defect Tracking', icon: ShieldAlert },
              { id: 'risks', label: 'Risk Register & DR', icon: ShieldCheck },
              { id: 'reports', label: 'Academic Reports', icon: FileText },
            ],
          },
          {
            groupName: 'PROJECT',
            items: [
              { id: 'pm', label: 'Project Management', icon: FolderGit2 },
              { id: 'uml', label: 'UML Diagrams', icon: Sparkles },
            ],
          },
        ];

      case 'Controller':
        return [
          {
            groupName: 'OVERVIEW',
            items: [{ id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard }],
          },
          {
            groupName: 'EXAMINATION',
            items: [
              { id: 'timetable', label: 'Timetable Review', icon: Grid },
              { id: 'clashes', label: 'Clash Audit', icon: AlertTriangle },
            ],
          },
          {
            groupName: 'OPERATIONS',
            items: [
              { id: 'seating', label: 'Seating Verification', icon: Award },
              { id: 'halltickets', label: 'Hall Tickets Status', icon: FileText },
              { id: 'hr-approvals', label: 'Duty Allocations', icon: UserCheck },
            ],
          },
          {
            groupName: 'QUALITY & MANAGEMENT',
            items: [{ id: 'reports', label: 'Executive Reports', icon: FileText }],
          },
          {
            groupName: 'PROJECT',
            items: [
              { id: 'pm', label: 'Project Progress', icon: FolderGit2 },
              { id: 'uml', label: 'System Architecture', icon: Sparkles },
            ],
          },
        ];

      case 'HR':
        return [
          {
            groupName: 'OPERATIONS',
            items: [
              { id: 'hr-approvals', label: 'HR Duty Approvals', icon: UserCheck },
              { id: 'invigilators', label: 'Staff Workload', icon: Users },
            ],
          },
          {
            groupName: 'QUALITY & MANAGEMENT',
            items: [{ id: 'reports', label: 'Workload Audit Reports', icon: FileText }],
          },
        ];

      case 'Student':
        return [
          {
            groupName: 'OVERVIEW',
            items: [
              { id: 'student-portal', label: 'Student Portal & Ticket', icon: GraduationCap },
              { id: 'timetable', label: 'Exam Timetable', icon: Calendar },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  const sidebarContent = (
    <aside
      className={`bg-[#0B1220] border-r border-slate-800/80 flex flex-col h-full select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-900/50 shrink-0">
            ◈
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">ExamSlot</h1>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wide uppercase block">
                Examination Suite
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Role Indicator */}
      <div className={`mx-3 my-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-[9px] text-slate-400 uppercase font-bold block leading-tight">Role Context</span>
              <span className="text-xs font-bold text-white truncate block">{activeRole}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onLogout}
            className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition shrink-0"
            title="Switch Role"
          >
            Switch
          </button>
        )}
      </div>

      {/* Navigation Grouped List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/80 mb-1.5">
                {group.groupName}
              </h2>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
          <p className="font-bold text-slate-400">ExamSlot v1.0 Enterprise</p>
          <p className="mt-0.5">Autonomous Academic Suite</p>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 no-print z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 h-full max-w-xs w-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
