/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  Trash2, 
  Sparkles, 
  Search, 
  Filter, 
  Video, 
  FileText, 
  Award, 
  BookMarked,
  Plus,
  PlayCircle,
  HelpCircle,
  Clock,
  LayoutGrid
} from "lucide-react";
import { CourseMaterial, UserRole, SchoolLevel, ClassRoom, Subject, Teacher } from "../types";
import { mockSubjects, mockClasses, mockTeachers } from "../mockData";

interface CourseSpaceProps {
  materials: CourseMaterial[];
  simulatedRole: UserRole;
  onUploadMaterial: (newMaterial: Omit<CourseMaterial, "id">) => void;
  onDeleteMaterial?: (id: string) => void;
}

export default function CourseSpace({
  materials: initialMaterials,
  simulatedRole,
  onUploadMaterial,
  onDeleteMaterial,
}: CourseSpaceProps) {
  // Local state for materials to allow fully interactive additions and deletions in demo
  const [localMaterials, setLocalMaterials] = useState<CourseMaterial[]>(initialMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Interaction: Track student completed lesson IDs
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(["mat_1"]);

  // Form states for uploading course material
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState(mockClasses[0]?.id || "");
  const [subjectId, setSubjectId] = useState(mockSubjects[0]?.id || "");
  const [fileType, setFileType] = useState<"pdf" | "video" | "image" | "doc">("pdf");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("1.8 MB");

  // Handle uploading simulation
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileName) {
      alert("Veuillez remplir le titre et le nom du fichier.");
      return;
    }

    const currentTeacherId = "tch_7"; // Default demo teacher
    const freshMaterial: CourseMaterial = {
      id: `mat_${Date.now()}`,
      title,
      description,
      subjectId,
      classId,
      teacherId: currentTeacherId,
      fileType,
      fileName,
      fileSize: fileSize || "1.5 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      downloadCount: 0
    };

    // Add to local state first
    setLocalMaterials([freshMaterial, ...localMaterials]);
    // Delegate to parent if provided
    onUploadMaterial(freshMaterial);

    // Reset Form
    setIsUploading(false);
    setTitle("");
    setDescription("");
    setFileName("");
  };

  const handleDeleteLocal = (id: string) => {
    setLocalMaterials(prev => prev.filter(m => m.id !== id));
    if (onDeleteMaterial) {
      onDeleteMaterial(id);
    }
  };

  const toggleLessonCompleted = (id: string) => {
    setCompletedLessonIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter Logic
  const filteredMaterials = localMaterials.filter(m => {
    const subjectObj = mockSubjects.find(sub => sub.id === m.subjectId);
    
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter level logic
    const matchesLevel = selectedLevel === "All" || (subjectObj && subjectObj.level === selectedLevel);
    
    // Filter subject logic
    const matchesSubject = selectedSubject === "All" || m.subjectId === selectedSubject;

    return matchesSearch && matchesLevel && matchesSubject;
  });

  // Calculate study progress stats for student
  const totalRelevantLessons = filteredMaterials.length;
  const completedLessonsCount = filteredMaterials.filter(m => completedLessonIds.includes(m.id)).length;
  const completionPercentage = totalRelevantLessons > 0 
    ? Math.round((completedLessonsCount / totalRelevantLessons) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title Header with custom spacing */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] bg-indigo-505 bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Espace Scolaire Pédagogique
            </span>
            <h1 className="text-xl md:text-2xl font-black">Gestion des Cours, Supports & Leçons</h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Accédez, téléchargez ou mettez en ligne les ressources d'apprentissage officielles du Collège Saint Josias adaptées à chaque niveau d'étude.
            </p>
          </div>
          <div className="flex gap-2.5">
            {(simulatedRole === UserRole.SUPER_ADMIN || simulatedRole === UserRole.ADMIN || simulatedRole === UserRole.TEACHER) && !isUploading && (
              <button 
                onClick={() => setIsUploading(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publier une Leçon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Filters, Upload forms, or Progress Card depending on the role */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section: Dynamic Student Progress Card (Only visible to Students / Parents) */}
          {(simulatedRole === UserRole.STUDENT || simulatedRole === UserRole.PARENT) && (
            <div className="p-5 bg-gradient-to-br from-violet-650 to-indigo-805 bg-gradient-to-r from-violet-650 to-indigo-800 text-white rounded-xl shadow-md border border-indigo-700/35 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Votre Progression Académique
              </h4>
              
              <div className="py-2">
                <h3 className="text-3xl font-black">{completionPercentage}%</h3>
                <p className="text-[11px] text-indigo-200 font-medium">Leçons maîtrisées et validées ce trimestre</p>
              </div>

              <div className="w-full bg-indigo-950/50 h-2.5 rounded-full overflow-hidden">
                <style dangerouslySetInnerHTML={{__html: `
                  .progress-bar-glow {
                    box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
                  }
                `}} />
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500 progress-bar-glow"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-indigo-300 font-bold">
                <span>{completedLessonsCount} validées</span>
                <span>{totalRelevantLessons} cours disponibles</span>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-lg text-[11px] leading-relaxed text-indigo-150">
                ⭐ <strong className="text-white">Félicitations Ariel !</strong> Vous êtes en tête sur le cours de <span className="font-bold text-indigo-300">Mathématiques</span>. Poursuivez vos efforts en Français !
              </div>
            </div>
          )}

          {/* Section: Upload form inside local sidebar for Teachers or Admins */}
          {isUploading && (
            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4 text-indigo-500" />
                  Mettre en ligne un cours
                </h3>
                <button 
                  onClick={() => setIsUploading(false)} 
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Titre de la leçon / cours<span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ex: Théorème de Pythagore"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Description / Consignes d'études</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-slate-850 h-20 bg-slate-50/50 outline-none"
                    placeholder="Instructions pour les étudiants, exercices suggérés..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Classe ciblée</label>
                    <select 
                      value={classId}
                      onChange={e => setClassId(e.target.value)}
                      className="w-full p-2 border rounded text-slate-800 bg-white"
                    >
                      {mockClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Matière</label>
                    <select 
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                      className="w-full p-2 border rounded text-slate-800 bg-white"
                    >
                      {mockSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.level})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Format</label>
                    <select 
                      value={fileType}
                      onChange={e => setFileType(e.target.value as any)}
                      className="w-full p-2 border rounded text-slate-800 bg-white"
                    >
                      <option value="pdf">Fichier PDF</option>
                      <option value="video">Leçon Vidéo</option>
                      <option value="doc">Document Word</option>
                      <option value="image">Graphique / Scan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">Taille (Fictive)</label>
                    <input 
                      type="text" 
                      value={fileSize}
                      onChange={e => setFileSize(e.target.value)}
                      className="w-full p-2 border rounded text-slate-800 bg-white"
                      placeholder="Ex: 2.5 MB"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Nom officiel du fichier pédagogique<span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    required
                    className="w-full p-2.5 border rounded-lg text-slate-800 bg-slate-50 outline-none"
                    placeholder="Ex: pythagore_cours_secondaire.pdf"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition shadow"
                >
                  Publier sur l'ERP du Collège
                </button>
              </form>
            </div>
          )}

          {/* Filters Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-indigo-500" />
              Filtrer les leçons
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Niveau d'étude</label>
                <select 
                  value={selectedLevel}
                  onChange={e => {
                    setSelectedLevel(e.target.value);
                    setSelectedSubject("All");
                  }}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-800 cursor-pointer"
                >
                  <option value="All">Tous les Niveaux ({SchoolLevel.MATERNEL}, {SchoolLevel.PRIMAIRE}, {SchoolLevel.SECONDAIRE})</option>
                  <option value={SchoolLevel.MATERNEL}>{SchoolLevel.MATERNEL}</option>
                  <option value={SchoolLevel.PRIMAIRE}>{SchoolLevel.PRIMAIRE}</option>
                  <option value={SchoolLevel.SECONDAIRE}>{SchoolLevel.SECONDAIRE}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Matière / Discipline</label>
                <select 
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 text-slate-800 cursor-pointer"
                >
                  <option value="All">Toutes les disciplines</option>
                  {mockSubjects
                    .filter(sub => selectedLevel === "All" || sub.level === selectedLevel)
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.level})</option>
                    ))
                  }
                </select>
              </div>

              <div className="border-t pt-3">
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  * Note: En tant qu'élève, l'ERP présélectionne automatiquement les cours approuvés par vos professeurs de classe.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: The Interactive Course Cards List Grid */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar helper */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-2.5 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher des fiches d'exercices, supports Powerpoint ou PDF..." 
              className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List layout header */}
          <div className="flex justify-between items-center text-xs px-1 text-slate-500">
            <span>Affichage de <strong>{filteredMaterials.length}</strong> leçons trouvées</span>
            <span className="flex items-center gap-1"><BookMarked className="w-3.5 h-3.5" /> Échanges Pédagogiques Numériques</span>
          </div>

          {/* Map of materials cards */}
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun support de cours correspondant</p>
              <p className="text-xs text-slate-450 text-slate-400">Veuillez modifier vos critères de filtrage de leçons.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map(mat => {
                const subjectObj = mockSubjects.find(s => s.id === mat.subjectId);
                const classObj = mockClasses.find(c => c.id === mat.classId);
                const teacherObj = mockTeachers.find(t => t.id === mat.teacherId);
                
                const isCompleted = completedLessonIds.includes(mat.id);

                return (
                  <div 
                    key={mat.id}
                    className="bg-white rounded-xl border border-slate-1 py-4.5 px-5 flex flex-col justify-between space-y-4 hover:shadow-md transition duration-200 border-slate-200 relative"
                  >
                    {/* Upper Indicators */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          mat.fileType === "pdf" ? "bg-red-50 text-red-650 text-red-600" :
                          mat.fileType === "video" ? "bg-cyan-50 text-cyan-600" : "bg-indigo-50 text-indigo-600"
                        }`}>
                          {mat.fileType === "pdf" ? "Fiche PDF" : mat.fileType === "video" ? "Vidéo MP4" : "Document Docx"}
                        </span>
                        
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {mat.fileSize}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                          {mat.title}
                        </h3>
                        {mat.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {mat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-[10px] text-slate-500">
                      <p className="flex justify-between">
                        <span>Discipline :</span> 
                        <strong className="text-slate-800">{subjectObj ? subjectObj.name : "Non spécifié"}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Classe :</span> 
                        <strong className="text-slate-800">{classObj ? classObj.name : "Générale"}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Publié par :</span> 
                        <strong className="text-indigo-600">{teacherObj ? `M./Mme ${teacherObj.firstName} ${teacherObj.lastName}` : "Professeur Saint Josias"}</strong>
                      </p>
                    </div>

                    {/* Interactive bottom buttons depending on context */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      {/* Action 1: Simulation Download */}
                      <button 
                        onClick={() => {
                          alert(`Simulation du téléchargement sécurisé du fichier de leçon: "${mat.fileName}" (${mat.fileSize})`);
                        }}
                        className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold transition cursor-pointer p-1"
                        title="Télécharger sur votre disque local"
                      >
                        <Download className="w-3.5 h-3.5" /> Télécharger
                      </button>

                      {/* Action 2: Only Visible for Students/Parents to mark read */}
                      {(simulatedRole === UserRole.STUDENT || simulatedRole === UserRole.PARENT) ? (
                        <button 
                          onClick={() => toggleLessonCompleted(mat.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all ${
                            isCompleted 
                              ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-300" 
                              : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200"
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-600 scale-110" : ""}`} />
                          {isCompleted ? "Acquis / Lu" : "Marquer comme appris"}
                        </button>
                      ) : (
                        /* Only for admins and instructors: Delete control */
                        (simulatedRole === UserRole.SUPER_ADMIN || simulatedRole === UserRole.ADMIN) && (
                          <button 
                            onClick={() => handleDeleteLocal(mat.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Supprimer
                          </button>
                        )
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
