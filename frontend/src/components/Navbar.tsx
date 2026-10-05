import React, { useState } from 'react';
import { UserRole, Student } from '../types';
import { Search, ShieldCheck, Calendar, Bell, Menu, User, ChevronDown, RefreshCw } from 'lucide-react';

interface Props {
  activeRole: UserRole;
  students: Student[];
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  onRefresh: () => void;
  onOpenMobileMenu: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  students,
  selectedStudentId,
  setSelectedStudentId,
  onRefresh,
  onOpenMobileMenu,
  onSelectRole,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 no-print">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search courses, students, slots..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-xs"
          />
        </div>

        {/* Student Role Picker Dropdown */}
        {activeRole === 'Student' && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg shrink-0">
            <span className="text-xs text-blue-700 font-semibold hidden lg:inline">Student ID:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="bg-white border border-blue-300 text-slate-800 text-xs rounded px-2 py-1 font-semibold focus:outline-none focus:border-blue-500"
            >
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_id} - {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Academic Context Badges & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2.5 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Autumn Semester 2026
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Conflict-Free Schedule
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
          title="Refresh Application State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative pl-3 border-l border-slate-200">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 text-left hover:bg-slate-50 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {activeRole.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">Antriksh M.</span>
              <span className="text-[10px] text-slate-500 block">{activeRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Switch Role View</p>
                <p className="text-[10px] text-slate-500">Test different user perspectives</p>
              </div>
              <div className="py-1">
                {(['ExamCell', 'Controller', 'HR', 'Student'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      onSelectRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition ${
                      activeRole === role ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{role} Portal</span>
                    {activeRole === role && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
