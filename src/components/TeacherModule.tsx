/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  BookOpen, 
  FolderUp, 
  Check, 
  UserSquare2, 
  Globe, 
  ChevronRight, 
  GraduationCap, 
  CheckCircle,
  FileText
} from "lucide-react";
import { Teacher, CourseMaterial, ClassRoom, Subject } from "../types";
import { mockSubjects, mockClasses } from "../mockData";
import { formatCurrency, formatCurrencyCompact } from "../utils";

interface TeacherModuleProps {
  teachers: Teacher[];
  materials: CourseMaterial[];
  classes: ClassRoom[];
  onAddTeacher: (teacher: Omit<Teacher, "id">) => void;
  onUploadMaterial: (material: Omit<CourseMaterial, "id">) => void;
}

export default function TeacherModule({
  teachers,
  materials,
  classes,
  onAddTeacher,
  onUploadMaterial,
}: TeacherModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  
  // Create Instructor form state
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [formFirst, setFormFirst] = useState("");
  const [formLast, setFormLast] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSpec, setFormSpec] = useState("");
  const [formSalary, setFormSalary] = useState(2500);

  // Material upload state
  const [isUploading, setIsUploading] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFile, setMatFile] = useState("");
  const [matSubject, setMatSubject] = useState(mockSubjects[0]?.id || "");
  const [matClass, setMatClass] = useState(mockClasses[0]?.id || "");
  const [matType, setMatType] = useState<"pdf" | "video" | "image" | "doc">("pdf");

  const filteredTeachers = teachers.filter(t => 
    `${t.firstName} ${t.lastName} ${t.specialty}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirst || !formLast || !formEmail) {
      alert("Champs obligatoires manquants.");
      return;
    }
    const newTeacher: Omit<Teacher, "id"> = {
      firstName: formFirst,
      lastName: formLast,
      email: formEmail,
      phone: formPhone,
      specialty: formSpec,
      salary: Number(formSalary),
      classIds: ["cls_s3"],
      subjectIds: ["sub_s_math"],
      status: "Actif",
      joinDate: new Date().toISOString().split('T')[0]
    };

    onAddTeacher(newTeacher);
    setIsAddingTeacher(false);
    // Reset
    setFormFirst("");
    setFormLast("");
    setFormEmail("");
    setFormPhone("");
    setFormSpec("");
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle || !matFile) {
      alert("Veuillez saisir au moins le titre et le nom du fichier.");
      return;
    }

    const newMat: Omit<CourseMaterial, "id"> = {
      title: matTitle,
      description: matDesc,
      subjectId: matSubject,
      classId: matClass,
      teacherId: activeTeacher ? activeTeacher.id : "tch_7",
      fileType: matType,
      fileName: matFile,
      fileSize: "1.5 MB",
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0
    };

    onUploadMaterial(newMat);
    setIsUploading(false);
    setMatTitle("");
    setMatDesc("");
    setMatFile("");
  };

  return (
    <div className="space-y-6">
      
      {isAddingTeacher ? (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 max-w-xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <UserSquare2 className="w-5 h-5 text-indigo-500" />
              Ajouter un Nouveau Professeur
            </h2>
            <button 
              onClick={() => setIsAddingTeacher(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-650 px-2.5 py-1 rounded cursor-pointer"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nom</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formLast} 
                  onChange={e => setFormLast(e.target.value)}
                  placeholder="Ex: COSSI"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Prénom</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formFirst} 
                  onChange={e => setFormFirst(e.target.value)}
                  placeholder="Ex: Jean-Luc"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Adresse E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formEmail} 
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="professeur@saintjosias.edu"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Numéro Téléphone</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formPhone} 
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+225 01..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Spécialité / Discipline</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formSpec} 
                  onChange={e => setFormSpec(e.target.value)}
                  placeholder="Ex: Mathématiques Supérieures"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Salaire Mensuel de base ($ / Dollar)</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border rounded-lg" 
                  value={formSalary} 
                  onChange={e => setFormSalary(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 cursor-pointer"
              >
                Enregistrer l'enseignant
              </button>
            </div>
          </form>
        </div>
      ) : activeTeacher ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedTeacherId(null)}
            className="text-xs text-slate-500 hover:text-indigo-600 cursor-pointer p-1"
          >
            ← Retour à la liste des enseignants
          </button>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">{activeTeacher.firstName} {activeTeacher.lastName}</h2>
              <span className="inline-block text-xs bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full font-bold">
                Spécialité: {activeTeacher.specialty}
              </span>
              <p className="text-xs text-slate-400">Date d'embauche: {activeTeacher.joinDate} • Contrat de travail actif</p>
              
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-505">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-slate-405" /> {activeTeacher.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-slate-405" /> {activeTeacher.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-150 min-w-44">
              <p className="text-xs text-slate-400">Rémunération Mensuelle</p>
              <h3 className="text-sm font-black text-slate-800">{formatCurrency(activeTeacher.salary)}</h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Salaire dument acquitté</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uploaded Material Management */}
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Ressources & Cours mis en ligne
                  </h3>
                  <button 
                    onClick={() => setIsUploading(!isUploading)}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    {isUploading ? "Annuler" : "Mettre en ligne cours"}
                  </button>
                </div>

                {isUploading ? (
                  <form onSubmit={handleMaterialSubmit} className="space-y-3 text-xs mb-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Titre du document cours</label>
                      <input 
                        type="text" 
                        value={matTitle} 
                        onChange={e => setMatTitle(e.target.value)}
                        className="w-full p-2 border rounded" 
                        placeholder="Ex: Introduction aux Probabilités"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Description rapide</label>
                      <textarea 
                        value={matDesc}
                        onChange={e => setMatDesc(e.target.value)}
                        className="w-full p-2 border rounded h-16" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Nom du fichier factice</label>
                        <input 
                          type="text" 
                          value={matFile} 
                          onChange={e => setMatFile(e.target.value)}
                          className="w-full p-2 border rounded" 
                          placeholder="Ex: probabilite_cours.pdf"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">Type de support</label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={matType}
                          onChange={e => setMatType(e.target.value as any)}
                        >
                          <option value="pdf">Fichier PDF</option>
                          <option value="doc">Document Word</option>
                          <option value="video">Vidéo d'illustration</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded cursor-pointer"
                    >
                      Enregistrer sur l'Espace Collaboratif
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs">
                    {materials
                      .filter(m => m.teacherId === activeTeacher.id)
                      .map(m => (
                        <div key={m.id} className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <div>
                              <p className="font-bold text-slate-800">{m.title}</p>
                              <p className="text-[10px] text-slate-400">{m.fileName} ({m.fileSize})</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-slate-200 text-slate-650 px-1.5 py-0.5 rounded">
                            {m.downloadCount} téléch.
                          </span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Performance Analysis and Class assignments */}
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Classes du formateur
              </h3>

              <div className="space-y-2 text-xs">
                <p className="text-slate-500">Ce professeur dispense activement des cours dans les classes suivantes :</p>
                {activeTeacher.classIds.map((cid, i) => {
                  const targetClass = mockClasses.find(cl => cl.id === cid);
                  return (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-slate-850">
                      <div>
                        <p className="font-bold">{targetClass ? targetClass.name : "Classe Secondaire"}</p>
                        <p className="text-[10px] text-slate-400">Total: {targetClass ? targetClass.totalStudents : 25} élèves</p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Coordinateur Principal
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 px-3 py-2 rounded-lg text-xs">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher professeur par spécialité..." 
                className="bg-transparent border-none outline-none w-full text-slate-850"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={() => setIsAddingTeacher(true)}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Recruter un Professeur
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id}
                className="p-4 bg-white rounded-xl border hover:border-indigo-150 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{teacher.firstName} {teacher.lastName}</h3>
                  <p className="text-xs text-indigo-650 font-medium mt-0.5">{teacher.specialty}</p>

                  <div className="space-y-1 text-xs text-slate-505 mt-4">
                    <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {teacher.email}</p>
                    <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {teacher.phone}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs">
                  <p className="text-slate-400">Salaire: <span className="font-bold text-slate-800">{formatCurrencyCompact(teacher.salary)}</span></p>
                  <button 
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center cursor-pointer"
                  >
                    Profil Pro →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
