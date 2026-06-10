/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  School, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  Percent, 
  ClipboardList, 
  UserSquare2,
  Trash2,
  CalendarDays
} from "lucide-react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClassRoom, Subject, SchoolLevel } from "../types";
import { mockSubjects, mockClasses, mockTeachers } from "../mockData";

const DnDCalendar = withDragAndDrop(Calendar);

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface SchoolStructureProps {
  classes: ClassRoom[];
  subjects: Subject[];
  onAddClass: (newClass: Omit<ClassRoom, "id" | "totalStudents">) => void;
  onAddSubject: (newSubject: Omit<Subject, "id">) => void;
}

export default function SchoolStructure({
  classes,
  subjects,
  onAddClass,
  onAddSubject,
}: SchoolStructureProps) {
  // Tabs "Classes", "Plan d'études" or "calendar"
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "calendar">("classes");
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Mathématiques - T1",
      start: new Date(2026, 5, 10, 8, 0),
      end: new Date(2026, 5, 10, 10, 0),
    },
    {
      id: 2,
      title: "Physique - T1",
      start: new Date(2026, 5, 11, 9, 0),
      end: new Date(2026, 5, 11, 11, 0),
    },
  ]);

  const onEventDrop = ({ event, start, end }: any) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  };

  const onEventResize = ({ event, start, end }: any) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  };

  // Add class states
  const [className, setClassName] = useState("");
  const [classLevel, setClassLevel] = useState<SchoolLevel>(SchoolLevel.SECONDAIRE);
  const [classTeacher, setClassTeacher] = useState(mockTeachers[0]?.id || "");
  const [classRoom, setClassRoom] = useState("");

  // Add subject states
  const [subName, setSubName] = useState("");
  const [subLevel, setSubLevel] = useState<SchoolLevel>(SchoolLevel.SECONDAIRE);
  const [subCoeff, setSubCoeff] = useState(3);

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) {
      alert("Spécifiez un libellé.");
      return;
    }
    const newCls: Omit<ClassRoom, "id" | "totalStudents"> = {
      name: className,
      level: classLevel,
      teacherId: classTeacher,
      roomNumber: classRoom || undefined
    };
    onAddClass(newCls);
    setClassName("");
    setClassRoom("");
  };

  const handleAddSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName) {
      alert("Spécifiez l'intitulé.");
      return;
    }
    const newSub: Omit<Subject, "id"> = {
      name: subName,
      level: subLevel,
      coefficient: Number(subCoeff)
    };
    onAddSubject(newSub);
    setSubName("");
  };

  return (
    <div className="space-y-6">
      
      {/* Category Navigation bar */}
      <div className="flex gap-4 border-b pb-2">
        <button 
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-1.5 pb-2 text-xs font-bold px-1 transition relative cursor-pointer ${
            activeTab === "classes" ? "text-indigo-600 font-extrabold border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <School className="w-4 h-4" /> Enseignement & Classes
        </button>
        <button 
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-1.5 pb-2 text-xs font-bold px-1 transition relative cursor-pointer ${
            activeTab === "subjects" ? "text-indigo-600 font-extrabold border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Matières & Coefficients
        </button>
        <button 
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-1.5 pb-2 text-xs font-bold px-1 transition relative cursor-pointer ${
            activeTab === "calendar" ? "text-indigo-600 font-extrabold border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Emploi du temps
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main List Area */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === "classes" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map(cls => {
                const headTeacher = mockTeachers.find(t => t.id === cls.teacherId);
                return (
                  <div key={cls.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">{cls.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {cls.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 mt-1">Salle : <span className="font-semibold text-slate-700">{cls.roomNumber || "Non spécifiée"}</span></p>
                      <p className="text-xs text-slate-450 mt-1">Prof. Principal : <strong className="text-slate-800 font-bold">{headTeacher ? `${headTeacher.firstName} ${headTeacher.lastName}` : "Non affecté"}</strong></p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-[11px]">
                      <span className="text-indigo-700 font-extrabold bg-indigo-50/50 px-2 py-0.5 rounded">
                        {cls.totalStudents} Élèves inscrits
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === "calendar" ? (
            <div className="h-128 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <DndProvider backend={HTML5Backend}>
                <DnDCalendar
                  localizer={localizer}
                  events={events}
                  onEventDrop={onEventDrop}
                  onEventResize={onEventResize}
                  resizable
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                />
              </DndProvider>
            </div>
          ) : (
            <div className="space-y-2 max-h-128 overflow-y-auto pr-1">
              {subjects.map(sub => (
                <div key={sub.id} className="p-3 bg-white hover:bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2">
                      {sub.level}
                    </span>
                    <strong className="text-slate-800 font-bold">{sub.name}</strong>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-indigo-700 font-black bg-indigo-50 px-2 py-1 rounded">
                      Coefficient: {sub.coefficient}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Configuration Creation side form */}
        <div>
          
          {activeTab === "classes" ? (
            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b">
                <Plus className="w-4 h-4 text-indigo-500" />
                Créer une nouvelle classe
              </h3>

              <form onSubmit={handleAddClassSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Nom de la classe</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white" 
                    value={className} 
                    onChange={e => setClassName(e.target.value)}
                    placeholder="Ex: Terminale T1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Niveau scolaire</label>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                    value={classLevel}
                    onChange={e => setClassLevel(e.target.value as SchoolLevel)}
                  >
                    <option value={SchoolLevel.MATERNEL}>Maternel</option>
                    <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                    <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Professeur Titulaire</label>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                    value={classTeacher}
                    onChange={e => setClassTeacher(e.target.value)}
                  >
                    {mockTeachers.map(t => (
                      <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Salle d'enseignement</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white" 
                    value={classRoom} 
                    onChange={e => setClassRoom(e.target.value)}
                    placeholder="Ex: Bâtiment B, Salle B10"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-lg cursor-pointer"
                >
                  Ajouter la Classe
                </button>
              </form>
            </div>
          ) : (
            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b">
                <Plus className="w-4 h-4 text-indigo-500" />
                Ajouter une matière
              </h3>

              <form onSubmit={handleAddSubSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Intitulé de matière</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white" 
                    value={subName} 
                    onChange={e => setSubName(e.target.value)}
                    placeholder="Ex: Philosophie"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Niveau Disciplinaire</label>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white"
                    value={subLevel}
                    onChange={e => setSubLevel(e.target.value as SchoolLevel)}
                  >
                    <option value={SchoolLevel.MATERNEL}>Maternel</option>
                    <option value={SchoolLevel.PRIMAIRE}>Primaire</option>
                    <option value={SchoolLevel.SECONDAIRE}>Secondaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Coefficient (Pondération)</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-white" 
                    value={subCoeff} 
                    onChange={e => setSubCoeff(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-lg cursor-pointer"
                >
                  Créer la Matière
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
