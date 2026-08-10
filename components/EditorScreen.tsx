
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from '../hooks/useTranslation';
import { CustomDataPackage, Director, Actor, Genre, TalentTrait, RandomEvent, MovieAwardYear, CustomEventData, ProjectPhase, MovieSize, Era } from '../types';
import { ALL_MALE_PORTRAITS, ALL_FEMALE_PORTRAITS } from './portraits';
import { COMPETITOR_STUDIO_NAMES } from './competitorData';
import StarIcon from './icons/StarIcon';
import TrashIcon from './icons/TrashIcon';
import NewsIcon from './icons/NewsIcon';
import MoneyBagIcon from './icons/MoneyBagIcon';
import ForschungIcon from './icons/ForschungIcon';
import ArchiveIcon from './icons/ArchiveIcon'; // For Import/Export Icons

// External Libraries via Import Map
import JSZip from 'jszip';
// Correctly import default export from file-saver for ESM environment
import saveAs from 'file-saver';

// Import Generators for Original Data
import { generateInitialActors } from './actors';
import { generateInitialDirectors } from './directors';
import { generateInitialMovieHistory } from './festivalData';

// Minimal ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface EditorScreenProps {
  onBack: () => void;
}

type EditorTab = 'talents' | 'competitors' | 'history' | 'events';

const EditorScreen: React.FC<EditorScreenProps> = ({ onBack }) => {
  const { saveCustomPackage, deleteCustomPackage, customPackages, setActiveDataPackage } = useGame();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<EditorTab>('talents');
  
  // Package Management State
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);
  const [selectedLoadId, setSelectedLoadId] = useState<string>('original');
  const [packageName, setPackageName] = useState('');
  const [showManageModal, setShowManageModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  
  // Data State
  const [actors, setActors] = useState<Actor[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [competitors, setCompetitors] = useState<{ id: number; name: string }[]>([]);
  const [awardHistory, setAwardHistory] = useState<MovieAwardYear[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEventData[]>([]);

  // Form States
  const [editingTalent, setEditingTalent] = useState<Partial<Actor | Director> | null>(null);
  const [editingEvent, setEditingEvent] = useState<CustomEventData | null>(null);
  
  const [isDirector, setIsDirector] = useState(false);
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  
  const [talentSortOrder, setTalentSortOrder] = useState<'id' | 'name'>('id');
  
  const importInputRef = useRef<HTMLInputElement>(null);

  // Load the actual game data as a starting point (Default Reset)
  const loadOriginalData = () => {
      setPackageName(''); // Clear name for new custom package
      setCurrentPackageId(null); // New ID will be generated on save
      setSelectedLoadId('original'); 

      // Load standard game data
      setActors(generateInitialActors());
      setDirectors(generateInitialDirectors());
      setCompetitors(COMPETITOR_STUDIO_NAMES.map((name, i) => ({ id: i + 1, name })));
      setAwardHistory(generateInitialMovieHistory(1990));
      setCustomEvents([]);
      
      setEditingTalent(null);
      setEditingEvent(null);
  };

  // Initial load
  useEffect(() => {
      loadOriginalData();
  }, []);

  // --- MOVED useMemo HERE (Top Level) to fix crash ---
  const sortedTalents = useMemo(() => {
      const list = isDirector ? directors : actors;
      return [...list].sort((a, b) => {
          if (talentSortOrder === 'name') {
              return a.name.localeCompare(b.name);
          }
          return a.id - b.id;
      });
  }, [directors, actors, isDirector, talentSortOrder]);

  const handleLoadPackage = (idToLoad?: string) => {
      const targetId = idToLoad || selectedLoadId;

      if (!targetId || targetId === 'original') {
          loadOriginalData();
          return;
      }
      
      const pkg = customPackages.find(p => p.id === targetId);
      if (!pkg) return;

      setCurrentPackageId(pkg.id);
      setPackageName(pkg.name);
      setActors(pkg.actors || []);
      setDirectors(pkg.directors || []);
      // Ensure competitors has defaults if empty in save
      if (pkg.competitors && pkg.competitors.length > 0) {
          setCompetitors(pkg.competitors);
      } else {
          setCompetitors(COMPETITOR_STUDIO_NAMES.map((name, i) => ({ id: i + 1, name })));
      }
      
      setAwardHistory(pkg.awardHistory || []);
      setCustomEvents(pkg.customEvents || []);
      setEditingTalent(null);
      setEditingEvent(null);
      setSelectedLoadId(targetId);
  };

  const executeDelete = (idToDelete: string) => {
      deleteCustomPackage(idToDelete);
      
      // If we deleted the currently active package, reset to original
      if (currentPackageId === idToDelete || selectedLoadId === idToDelete) {
          loadOriginalData();
      }
      setPackageToDelete(null);
  };

  const handleSavePackage = () => {
    if (!packageName.trim()) {
        alert(t.editor.package.nameAlert);
        return;
    }
    
    // Use existing ID if we are editing (and it's not original), otherwise create new
    const idToUse = (currentPackageId && selectedLoadId !== 'original') ? currentPackageId : `pkg_${Date.now()}`;
    
    const newPackage: CustomDataPackage = {
        id: idToUse,
        name: packageName,
        created: Date.now(),
        actors,
        directors,
        competitors,
        awardHistory,
        customEvents
    };
    
    saveCustomPackage(newPackage);
    setCurrentPackageId(idToUse);
    setSelectedLoadId(idToUse);
    alert(t.editor.package.savedAlert);
  };

  // --- EXPORT FUNCTIONALITY (ZIP) ---
  const handleExportZip = async () => {
    if (!packageName.trim()) {
        alert(t.editor.package.nameAlert);
        return;
    }

    try {
        const zip = new JSZip();
        const imgFolder = zip.folder("portraits");

        // Clone data to modify portrait references without affecting current state in UI
        // We MUST use JSON parse/stringify to get a deep clean copy
        const exportActors = JSON.parse(JSON.stringify(actors));
        const exportDirectors = JSON.parse(JSON.stringify(directors));

        // Function to process portraits and add them to ZIP
        const processPortraits = (list: any[]) => {
            list.forEach((t: any) => {
                // Check if portrait is a Data URL (starts with data:image)
                if (t.portraitUrl && typeof t.portraitUrl === 'string' && t.portraitUrl.startsWith('data:image')) {
                    try {
                        // Regex to capture extension and data
                        const matches = t.portraitUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                        
                        if (matches && matches.length === 3) {
                            let extension = matches[1];
                            const base64Data = matches[2];
                            
                            // Normalize extension
                            if (extension === 'jpeg') extension = 'jpg';
                            if (extension === 'svg+xml') extension = 'svg'; // Unlikely for portraits but good to have
                            
                            // Generate safe filename based on ID
                            const safeId = String(t.id).replace(/[^a-zA-Z0-9]/g, '_');
                            const fileName = `${safeId}_custom.${extension}`;
                            
                            // Add file to ZIP
                            if (imgFolder) {
                                imgFolder.file(fileName, base64Data, { base64: true });
                                // Update reference in JSON (relative path inside zip)
                                t.portraitUrl = `portraits/${fileName}`;
                            }
                        } else {
                            console.warn("Invalid Data URL format for:", t.name);
                        }
                    } catch (e) {
                        console.error("Error processing portrait for export:", e);
                    }
                }
            });
        };

        processPortraits(exportActors);
        processPortraits(exportDirectors);

        const packageData: CustomDataPackage = {
            id: currentPackageId || `pkg_${Date.now()}`,
            name: packageName,
            created: Date.now(),
            actors: exportActors,
            directors: exportDirectors,
            competitors,
            awardHistory,
            customEvents
        };

        zip.file("data.json", JSON.stringify(packageData, null, 2));

        const content = await zip.generateAsync({ type: "blob" });
        const safeName = packageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(content, `${safeName}.zip`);

    } catch (error) {
        console.error("Export failed:", error);
        alert("Export fehlgeschlagen: " + error);
    }
  };

  // --- IMPORT FUNCTIONALITY (ZIP) ---
  const handleImportZipClick = () => {
      if (importInputRef.current) importInputRef.current.click();
  };

  const handleImportZipFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const zip = await JSZip.loadAsync(file);
          
          // 1. Read Data JSON - Try to find it even if not in root
          let jsonFile = zip.file("data.json");
          if (!jsonFile) {
              // Fuzzy search for data.json
              const jsonPath = Object.keys(zip.files).find(path => path.endsWith("data.json"));
              if (jsonPath) jsonFile = zip.file(jsonPath);
          }
          
          if (!jsonFile) throw new Error("data.json nicht in der ZIP-Datei gefunden!");
          
          const jsonStr = await jsonFile.async("string");
          const packageData: CustomDataPackage = JSON.parse(jsonStr);

          // 2. Re-hydrate Images
          // This converts paths like "portraits/123.png" back into base64 Data URLs
          const rehydrateImages = async (list: any[]) => {
              if (!list) return;
              for (const t of list) {
                  // Check if it's a file path and NOT a standard portrait ID (standard IDs like "m1", "w5" have no extension)
                  // And not already a base64 string
                  if (t.portraitUrl && typeof t.portraitUrl === 'string' && !t.portraitUrl.startsWith('data:') && (t.portraitUrl.includes('.') || t.portraitUrl.includes('/'))) {
                      
                      let imgFile = zip.file(t.portraitUrl);
                      
                      // Fuzzy search if strict path fails (e.g. if user zipped a folder structure)
                      if (!imgFile) {
                          const fileName = t.portraitUrl.split('/').pop(); // e.g. "myface.jpg"
                          if (fileName) {
                              const foundPath = Object.keys(zip.files).find(path => path.endsWith(fileName));
                              if (foundPath) {
                                  imgFile = zip.file(foundPath);
                              }
                          }
                      }

                      if (imgFile) {
                          const base64 = await imgFile.async("base64");
                          let ext = t.portraitUrl.split('.').pop()?.toLowerCase() || 'png';
                          if (ext === 'jpg') ext = 'jpeg';
                          
                          t.portraitUrl = `data:image/${ext};base64,${base64}`;
                      } else {
                          console.warn(`Bild nicht in ZIP gefunden: ${t.portraitUrl} für Talent ${t.name}`);
                      }
                  }
              }
          };

          if (packageData.actors) await rehydrateImages(packageData.actors);
          if (packageData.directors) await rehydrateImages(packageData.directors);

          // 3. Save to Game Context (LocalStorage)
          saveCustomPackage(packageData);
          
          // 4. Load into Editor State
          setCurrentPackageId(packageData.id);
          setPackageName(packageData.name);
          setActors(packageData.actors || []);
          setDirectors(packageData.directors || []);
          setCompetitors(packageData.competitors || []);
          setAwardHistory(packageData.awardHistory || []);
          setCustomEvents(packageData.customEvents || []);
          setSelectedLoadId(packageData.id);
          
          alert(`Paket "${packageData.name}" erfolgreich importiert!`);

      } catch (error) {
          console.error("Import failed:", error);
          alert("Import fehlgeschlagen: " + error);
      }
      
      // Reset input to allow re-importing same file if needed
      if (importInputRef.current) importInputRef.current.value = '';
  };


  // --- TALENT LOGIC ---
  const handleAddTalent = () => {
      const newTalent: any = {
          id: parseInt(generateId().replace(/\D/g, '').substring(0,6) || '10000'), // Quick fake ID
          name: '',
          gender: 'männlich',
          birthDate: new Date(1965, 0, 1),
          skill: 50,
          potential: 80,
          cost: 10000,
          bekanntheit: 0,
          favoriteGenres: [],
          hatedGenre: '' as Genre,
          traits: [],
          experience: 0,
          loyalty: 50,
          moral: 50,
          isDiscovered: false,
          portraitUrl: 'm1',
          isCustom: true
      };
      
      if (isDirector) {
          newTalent.speedModifier = 1.0;
      }
      
      setEditingTalent(newTalent);
  };
  
  const saveTalent = () => {
      if (!editingTalent || !editingTalent.name) return;
      
      // Calculate Cost using Tiered Formula
      const skill = editingTalent.skill || 50;
      
      let multiplier = isDirector ? 8 : 10;
      if (skill <= 20) multiplier = isDirector ? 2 : 4;
      else if (skill <= 50) multiplier = isDirector ? 4 : 6;
      else if (skill <= 80) multiplier = isDirector ? 6 : 8;

      const baseCost = 15000 + multiplier * Math.pow(skill, 3.1);
      const cost = Math.round(baseCost / 100) * 100;
      
      const finalTalent = { ...editingTalent, cost } as Actor | Director;
      
      if (isDirector) {
          // If editing existing, replace it
          if (directors.some(d => d.id === finalTalent.id)) {
              setDirectors(directors.map(d => d.id === finalTalent.id ? finalTalent as Director : d));
          } else {
              setDirectors([...directors, finalTalent as Director]);
          }
      } else {
           if (actors.some(a => a.id === finalTalent.id)) {
              setActors(actors.map(a => a.id === finalTalent.id ? finalTalent as Actor : a));
          } else {
              setActors([...actors, finalTalent as Actor]);
          }
      }
      setEditingTalent(null);
  };

  // --- EVENT LOGIC ---
  const handleAddEvent = () => {
      const newEvent: CustomEventData = {
          id: `custom_${generateId()}`,
          title: 'New Event',
          text: '',
          category: 'World',
          frequency: 'medium',
          effects: {
              capitalChange: 0,
              reputationChange: 0,
              researchPointsChange: 0
          }
      };
      setEditingEvent(newEvent);
  };

  const saveEvent = () => {
      if (!editingEvent || !editingEvent.title) return;
      
      if (customEvents.some(e => e.id === editingEvent.id)) {
          setCustomEvents(customEvents.map(e => e.id === editingEvent.id ? editingEvent : e));
      } else {
          setCustomEvents([...customEvents, editingEvent]);
      }
      setEditingEvent(null);
  };
  
  const deleteEvent = (id: string) => {
      setCustomEvents(customEvents.filter(e => e.id !== id));
      if (editingEvent?.id === id) setEditingEvent(null);
  };


  const handleCompetitorChange = (id: number, newName: string) => {
      setCompetitors(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };
  
  const handleHistoryChange = (index: number, field: keyof MovieAwardYear, value: any) => {
      const newHistory = [...awardHistory];
      newHistory[index] = { ...newHistory[index], [field]: value };
      setAwardHistory(newHistory);
  };

  // --- TRAIT HELPERS ---
  const handleAddTrait = (trait: TalentTrait) => {
      if (!editingTalent) return;
      const currentTraits = editingTalent.traits || [];
      if (!currentTraits.includes(trait)) {
          setEditingTalent({ ...editingTalent, traits: [...currentTraits, trait] });
      }
  };

  const handleRemoveTrait = (traitToRemove: TalentTrait) => {
      if (!editingTalent) return;
      const currentTraits = editingTalent.traits || [];
      setEditingTalent({ ...editingTalent, traits: currentTraits.filter(t => t !== traitToRemove) });
  };
  
  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Store the full Data URL
                setEditingTalent(prev => prev ? { ...prev, portraitUrl: base64String } : null);
                setShowPortraitModal(false);
            };
            reader.readAsDataURL(file);
        }
    };
    
  // --- PORTRAIT HELPER FOR MODAL ---
  const getModalPortraitList = () => {
      if (!editingTalent) return [];
      const isFemale = editingTalent.gender === 'weiblich';
      return isFemale ? ALL_FEMALE_PORTRAITS : ALL_MALE_PORTRAITS;
  };
  
  const getAgeSuffix = () => {
      if (!editingTalent || !editingTalent.birthDate) return 'm';
      const gameStart = new Date(1990, 0, 1);
      const birth = new Date(editingTalent.birthDate);
      let age = gameStart.getFullYear() - birth.getFullYear();
      
      if (age <= 15) return 'k';
      if (age <= 34) return 'j';
      if (age <= 59) return 'm';
      return 'a';
  };

  // --- RENDERERS ---

  const renderTalentTab = () => {
      const currentAgeSuffix = getAgeSuffix();
      const gameStartAge = editingTalent && editingTalent.birthDate 
        ? Math.floor((new Date(1990, 0, 1).getTime() - new Date(editingTalent.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : 0;

      return (
      <div className="flex gap-4 h-full">
          <div className="w-1/3 bg-gray-900/50 p-4 rounded overflow-y-auto">
              <div className="flex justify-between mb-4">
                  <h3 className="text-white font-bold">{t.editor.tabs.talents}</h3>
                  {/* FIX: Call handleAddTalent to create new, don't just clear selection */}
                  <button onClick={handleAddTalent} className="text-sm text-gray-400 hover:text-white">{t.editor.talents.addNew}</button>
              </div>
              <div className="flex gap-2 mb-4">
                  <button onClick={() => setIsDirector(false)} className={`flex-1 py-1 rounded text-sm ${!isDirector ? 'bg-amber-600 text-white' : 'bg-gray-700'}`}>{t.editor.talents.actors} ({actors.length})</button>
                  <button onClick={() => setIsDirector(true)} className={`flex-1 py-1 rounded text-sm ${isDirector ? 'bg-amber-600 text-white' : 'bg-gray-700'}`}>{t.editor.talents.directors} ({directors.length})</button>
              </div>

              <div className="mb-4">
                   <select
                      value={talentSortOrder}
                      onChange={(e) => setTalentSortOrder(e.target.value as 'id' | 'name')}
                      className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
                  >
                      <option value="id">{t.editor.talents.sortById}</option>
                      <option value="name">{t.editor.talents.sortByName}</option>
                  </select>
              </div>
              
              <div className="space-y-2">
                  {sortedTalents.map((t, idx) => (
                      <div key={t.id} className="p-2 bg-gray-800 rounded flex justify-between items-center cursor-pointer hover:bg-gray-700" onClick={() => setEditingTalent(t)}>
                          <span className="truncate w-32">{t.name}</span>
                          <button onClick={(e) => {
                              e.stopPropagation();
                              if(isDirector) setDirectors(prev => prev.filter(d => d.id !== t.id));
                              else setActors(prev => prev.filter(a => a.id !== t.id));
                              if (editingTalent?.id === t.id) setEditingTalent(null);
                          }} className="text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4"/></button>
                      </div>
                  ))}
                  <button onClick={handleAddTalent} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 mt-2">{t.editor.talents.addNew}</button>
              </div>
          </div>
          
          <div className="w-2/3 bg-gray-900/50 p-4 rounded overflow-y-auto">
              {editingTalent ? (
                  <div className="space-y-4">
                      <h3 className="text-amber-400 font-bold border-b border-gray-700 pb-2">{t.editor.talents.edit} (ID: {editingTalent.id})</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.name}</label>
                              <input type="text" value={editingTalent.name} onChange={e => setEditingTalent({...editingTalent, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white"/>
                          </div>
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.gender}</label>
                              <select value={editingTalent.gender} onChange={e => setEditingTalent({...editingTalent, gender: e.target.value as any})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white">
                                  <option value="männlich">{t.editor.talents.male}</option>
                                  <option value="weiblich">{t.editor.talents.female}</option>
                              </select>
                          </div>
                      </div>

                      {/* Birth Date Field & Age Display */}
                      <div className="flex gap-4">
                          <div className="flex-grow">
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.birthDate}</label>
                              <div className="relative">
                                  <input
                                      type="date"
                                      min="1900-01-01"
                                      max="1980-12-31"
                                      value={editingTalent.birthDate ? new Date(editingTalent.birthDate).toISOString().split('T')[0] : ''}
                                      onChange={e => setEditingTalent({ ...editingTalent, birthDate: new Date(e.target.value) })}
                                      // START OF CHANGES: Blocking keyboard and forcing picker on click
                                      onKeyDown={(e) => e.preventDefault()}
                                      onClick={(e) => e.currentTarget.showPicker()}
                                      onFocus={(e) => e.target.showPicker()}
                                      className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white cursor-pointer [color-scheme:dark] relative z-10 caret-transparent"
                                  />
                              </div>
                          </div>
                          <div className="w-1/4">
                              <label className="block text-xs text-gray-400 mb-1">{t.office.contacts.sortAge} (1990)</label>
                              <div className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-white text-center text-sm flex items-center justify-center h-[32px]">
                                  {gameStartAge}
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.skill}</label>
                              <input type="number" value={editingTalent.skill} onChange={e => setEditingTalent({...editingTalent, skill: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white"/>
                          </div>
                           <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.potential}</label>
                              <input type="number" value={editingTalent.potential} onChange={e => setEditingTalent({...editingTalent, potential: parseInt(e.target.value)})} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white"/>
                          </div>
                      </div>

                      {/* Genres Section */}
                      <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                          <label className="block text-xs text-amber-400 mb-2 font-bold uppercase">{t.editor.talents.genres}</label>
                          <div className="grid grid-cols-3 gap-2">
                              <div>
                                  <label className="block text-[10px] text-gray-400 mb-1">{t.editor.talents.favGenre1}</label>
                                  <select
                                      value={editingTalent.favoriteGenres?.[0] || ''}
                                      onChange={(e) => {
                                          const newGenres = [...(editingTalent.favoriteGenres || [])];
                                          newGenres[0] = e.target.value as Genre;
                                          setEditingTalent({ ...editingTalent, favoriteGenres: newGenres });
                                      }}
                                      className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-xs text-white"
                                  >
                                      <option value="">-</option>
                                      {Object.values(Genre).map(g => <option key={g} value={g}>{t.genres[g]}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] text-gray-400 mb-1">{t.editor.talents.favGenre2}</label>
                                  <select
                                      value={editingTalent.favoriteGenres?.[1] || ''}
                                      onChange={(e) => {
                                          const newGenres = [...(editingTalent.favoriteGenres || [])];
                                          newGenres[1] = e.target.value as Genre;
                                          setEditingTalent({ ...editingTalent, favoriteGenres: newGenres });
                                      }}
                                      className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-xs text-white"
                                  >
                                      <option value="">-</option>
                                      {Object.values(Genre).map(g => <option key={g} value={g}>{t.genres[g]}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] text-gray-400 mb-1 text-red-400">{t.editor.talents.hatedGenre}</label>
                                  <select
                                      value={editingTalent.hatedGenre || ''}
                                      onChange={(e) => setEditingTalent({ ...editingTalent, hatedGenre: e.target.value as Genre })}
                                      className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-xs text-white"
                                  >
                                      <option value="">-</option>
                                      {Object.values(Genre).map(g => <option key={g} value={g}>{t.genres[g]}</option>)}
                                  </select>
                              </div>
                          </div>
                      </div>

                      {/* Traits Section */}
                      <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                          <label className="block text-xs text-amber-400 mb-2 font-bold uppercase">{t.editor.talents.traits}</label>
                          
                          {/* Active Traits List */}
                          <div className="flex flex-wrap gap-2 mb-2">
                              {(editingTalent.traits || []).map((trait, index) => (
                                  <div key={index} className="bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center gap-2 border border-gray-600">
                                     {/* @ts-ignore */}
                                     <span>{t.traits[trait]?.name || trait}</span>
                                     <button 
                                        onClick={() => handleRemoveTrait(trait)} 
                                        className="text-red-400 hover:text-red-300 font-bold px-1"
                                        title="Entfernen"
                                     >
                                         ×
                                     </button>
                                  </div>
                              ))}
                              {(editingTalent.traits || []).length === 0 && <span className="text-gray-500 text-xs italic">{t.editor.talents.noTraits}</span>}
                          </div>

                          {/* Add Trait Dropdown */}
                          <select 
                              value="" 
                              onChange={(e) => handleAddTrait(e.target.value as TalentTrait)}
                              className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-xs text-white focus:border-amber-500 outline-none"
                          >
                              <option value="">{t.editor.talents.addTrait}</option>
                              {Object.values(TalentTrait)
                                  .filter(trait => !(editingTalent.traits || []).includes(trait))
                                  .map(trait => (
                                      // @ts-ignore
                                      <option key={trait} value={trait}>{t.traits[trait]?.name || trait}</option>
                                  ))
                              }
                          </select>
                      </div>

                      <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.fame}</label>
                            <input type="range" min="0" max="5" value={editingTalent.bekanntheit} onChange={e => setEditingTalent({...editingTalent, bekanntheit: parseInt(e.target.value), isDiscovered: parseInt(e.target.value) > 0})} className="w-full accent-amber-500"/>
                            <div className="text-right text-xs text-amber-400">{editingTalent.bekanntheit} {editingTalent.bekanntheit && editingTalent.bekanntheit > 0 ? `(${t.editor.talents.discovered})` : `(${t.editor.talents.undiscovered})`}</div>
                      </div>

                       <div>
                          <label className="block text-xs text-gray-400 mb-1">{t.editor.talents.portrait}</label>
                          <div className="flex gap-4 items-center">
                              <div className="w-20 h-20 bg-gray-700 rounded overflow-hidden cursor-pointer border hover:border-amber-500" onClick={() => setShowPortraitModal(true)}>
                                  {editingTalent.portraitUrl ? (
                                      editingTalent.portraitUrl.startsWith('data:') ? (
                                          <img src={editingTalent.portraitUrl} className="w-full h-full object-cover" alt="Portrait"/>
                                      ) : (
                                          <img src={`https://www.schnoxcore.com/media/portraits/${editingTalent.portraitUrl}${currentAgeSuffix}.png`} className="w-full h-full object-cover" alt="Portrait"/>
                                      )
                                  ) : null}
                              </div>
                              <button onClick={() => setShowPortraitModal(true)} className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">{t.editor.talents.choose}</button>
                          </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                          <button onClick={saveTalent} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">{t.editor.talents.apply}</button>
                      </div>
                  </div>
              ) : (
                  <p className="text-gray-500 italic text-center mt-20">{t.editor.talents.selectPrompt}</p>
              )}
          </div>
          
           {showPortraitModal && (
            <div className="absolute inset-0 bg-black/90 z-50 p-8 overflow-y-auto" onClick={() => setShowPortraitModal(false)}>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 mb-4 max-w-2xl mx-auto" onClick={e => e.stopPropagation()}>
                    <h3 className="text-white font-bold mb-2">{t.editor.talents.uploadTitle}</h3>
                     <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                    />
                     <p className="text-xs text-gray-500 mt-2">{t.editor.talents.uploadHint}</p>
                </div>
                
                <h3 className="text-white font-bold mb-4 text-center">{t.editor.talents.standardTitle} (Vorschau: {currentAgeSuffix === 'k' ? 'Kind' : currentAgeSuffix === 'j' ? 'Jung' : currentAgeSuffix === 'm' ? 'Erwachsen' : 'Alt'})</h3>
                <div className="grid grid-cols-8 gap-2" onClick={e => e.stopPropagation()}>
                    {(editingTalent?.gender === 'weiblich' ? ALL_FEMALE_PORTRAITS : ALL_MALE_PORTRAITS).map(id => (
                        <img 
                            key={id} 
                            src={`https://www.schnoxcore.com/media/portraits/${id}${currentAgeSuffix}.png`} 
                            className="w-full h-auto cursor-pointer hover:scale-110 transition-transform border border-transparent hover:border-amber-500" 
                            onClick={() => {
                                setEditingTalent(prev => prev ? {...prev, portraitUrl: id} : null);
                                setShowPortraitModal(false);
                            }}
                        />
                    ))}
                </div>
                <div className="text-center mt-6">
                    <button onClick={() => setShowPortraitModal(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded">{t.editor.cancel}</button>
                </div>
            </div>
        )}
      </div>
  )};
  
  const renderEventsTab = () => (
      <div className="flex gap-4 h-full">
          <div className="w-1/3 bg-gray-900/50 p-4 rounded overflow-y-auto">
              <div className="flex justify-between mb-4">
                  <h3 className="text-white font-bold">{t.editor.tabs.events}</h3>
                  {/* FIX: Call handleAddEvent to create new, don't just clear selection */}
                  <button onClick={handleAddEvent} className="text-sm text-gray-400 hover:text-white">{t.editor.events.addNew}</button>
              </div>
              
              <div className="space-y-2">
                  {customEvents.map((evt, idx) => (
                      <div key={evt.id} className="p-3 bg-gray-800 rounded flex flex-col cursor-pointer hover:bg-gray-700" onClick={() => setEditingEvent(evt)}>
                          <div className="flex justify-between items-start">
                              <span className="font-bold text-white text-sm truncate">{evt.title}</span>
                              <button onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(evt.id);
                              }} className="text-red-400 hover:text-red-300 ml-2"><TrashIcon className="w-4 h-4"/></button>
                          </div>
                          <span className="text-xs text-gray-500 uppercase">{evt.category}</span>
                      </div>
                  ))}
                  <button onClick={handleAddEvent} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 mt-2">{t.editor.events.addNew}</button>
              </div>
          </div>
          
          <div className="w-2/3 bg-gray-900/50 p-4 rounded overflow-y-auto">
              {editingEvent ? (
                  <div className="space-y-4">
                      <h3 className="text-amber-400 font-bold border-b border-gray-700 pb-2">{t.editor.events.edit}</h3>
                      
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">{t.editor.events.titleLabel}</label>
                          <input 
                            type="text" 
                            value={editingEvent.title} 
                            onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} 
                            className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white font-bold"
                          />
                      </div>
                      
                      {(editingEvent.category === 'Studio' || editingEvent.category === 'Personal') && (
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Absender (Email)</label>
                              <input 
                                type="text" 
                                value={(editingEvent as any).sender || ''} // Cast to any to avoid TS errors if interface isn't updated yet
                                onChange={e => setEditingEvent({...editingEvent, sender: e.target.value} as any)} 
                                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white"
                                placeholder={editingEvent.category === 'Studio' ? 'z.B. Buchhaltung' : 'z.B. Unbekannt'}
                              />
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.events.category}</label>
                              <select 
                                value={editingEvent.category} 
                                onChange={e => setEditingEvent({...editingEvent, category: e.target.value as any})} 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm"
                              >
                                  <option value="World">{t.editor.events.catWorld}</option>
                                  <option value="Industry">{t.editor.events.catIndustry}</option>
                                  <option value="Studio">{t.editor.events.catStudio}</option>
                                  <option value="Personal">{t.editor.events.catPersonal}</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">{t.editor.events.frequency}</label>
                              <select 
                                value={editingEvent.frequency} 
                                onChange={e => setEditingEvent({...editingEvent, frequency: e.target.value as any})} 
                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm"
                              >
                                  <option value="common">{t.editor.events.freqCommon}</option>
                                  <option value="medium">{t.editor.events.freqMedium}</option>
                                  <option value="rare">{t.editor.events.freqRare}</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-gray-400 mb-1">{t.editor.events.textLabel}</label>
                          <textarea 
                            value={editingEvent.text} 
                            onChange={e => setEditingEvent({...editingEvent, text: e.target.value})} 
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm h-32 resize-none"
                          />
                      </div>

                      <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                          <label className="block text-xs text-amber-400 mb-3 font-bold uppercase border-b border-gray-600 pb-1">{t.editor.events.effects}</label>
                          
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><MoneyBagIcon className="w-3 h-3"/> {t.editor.events.capital}</label>
                                  <input 
                                    type="number" 
                                    value={editingEvent.effects?.capitalChange || 0} 
                                    onChange={e => setEditingEvent({...editingEvent, effects: {...editingEvent.effects, capitalChange: parseInt(e.target.value)}})} 
                                    className={`w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm font-mono ${editingEvent.effects.capitalChange > 0 ? 'text-green-400' : editingEvent.effects.capitalChange < 0 ? 'text-red-400' : 'text-gray-400'}`}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><StarIcon className="w-3 h-3"/> {t.editor.events.reputation}</label>
                                  <input 
                                    type="number" 
                                    value={editingEvent.effects?.reputationChange || 0} 
                                    onChange={e => setEditingEvent({...editingEvent, effects: {...editingEvent.effects, reputationChange: parseInt(e.target.value)}})} 
                                    className={`w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm font-mono ${editingEvent.effects.reputationChange > 0 ? 'text-green-400' : editingEvent.effects.reputationChange < 0 ? 'text-red-400' : 'text-gray-400'}`}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><ForschungIcon className="w-3 h-3"/> {t.editor.events.research}</label>
                                  <input 
                                    type="number" 
                                    value={editingEvent.effects?.researchPointsChange || 0} 
                                    onChange={e => setEditingEvent({...editingEvent, effects: {...editingEvent.effects, researchPointsChange: parseInt(e.target.value)}})} 
                                    className={`w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm font-mono ${editingEvent.effects.researchPointsChange > 0 ? 'text-green-400' : editingEvent.effects.researchPointsChange < 0 ? 'text-red-400' : 'text-gray-400'}`}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                          <button onClick={saveEvent} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">{t.editor.package.save}</button>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <NewsIcon className="w-16 h-16 mb-4 opacity-20"/>
                      <p className="italic">{t.editor.events.selectPrompt}</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderCompetitorsTab = () => (
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
              {competitors.map(comp => (
                  <div key={comp.id} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded border border-gray-700">
                      <span className="text-gray-500 w-8">#{comp.id}</span>
                      <input 
                        type="text" 
                        value={comp.name} 
                        onChange={(e) => handleCompetitorChange(comp.id, e.target.value)}
                        className="flex-grow bg-transparent border-b border-gray-600 focus:border-amber-500 outline-none text-white px-1"
                      />
                  </div>
              ))}
          </div>
      </div>
  );
  
  const renderHistoryTab = () => (
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-gray-400">
                  <tr>
                      <th className="p-2">{t.editor.history.year}</th>
                      <th className="p-2">{t.editor.history.bestFilm}</th>
                      <th className="p-2">{t.editor.history.bestDirector}</th>
                      <th className="p-2">{t.editor.history.bestActor}</th>
                  </tr>
              </thead>
              <tbody>
                  {awardHistory.map((entry, idx) => (
                      <tr key={entry.year} className="border-b border-gray-700">
                          <td className="p-2 text-amber-400 font-bold">{entry.year}</td>
                          <td className="p-2"><input type="text" value={entry.bestFilm} onChange={e => handleHistoryChange(idx, 'bestFilm', e.target.value)} className="bg-transparent w-full outline-none text-white"/></td>
                          <td className="p-2"><input type="text" value={entry.bestDirector} onChange={e => handleHistoryChange(idx, 'bestDirector', e.target.value)} className="bg-transparent w-full outline-none text-white"/></td>
                          <td className="p-2"><input type="text" value={entry.bestActor} onChange={e => handleHistoryChange(idx, 'bestActor', e.target.value)} className="bg-transparent w-full outline-none text-white"/></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center gap-4">
            <h1 className="text-2xl font-cinzel text-amber-400 whitespace-nowrap">{t.editor.title}</h1>
            
            <div className="flex-grow flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-600">
                {/* Load Selection */}
                <select 
                    value={selectedLoadId}
                    onChange={(e) => handleLoadPackage(e.target.value)}
                    className="bg-gray-700 text-white rounded p-1 border border-gray-600 text-sm focus:border-amber-500 outline-none"
                >
                    <option value="original">{t.editor.package.original}</option>
                    {customPackages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button onClick={() => handleLoadPackage()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded text-sm">{t.editor.package.load}</button>
                
                {/* Manage Button - Replaces direct Delete */}
                <button 
                    onClick={() => setShowManageModal(true)} 
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                    {t.editor.package.manage}
                </button>
                
                <div className="h-6 w-px bg-gray-600 mx-2"></div>
                
                {/* Save Section */}
                <input 
                    type="text" 
                    placeholder={t.editor.package.namePlaceholder}
                    value={packageName} 
                    onChange={e => setPackageName(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm flex-grow"
                />
                {/* FIX: Button text is now always "Save" */}
                <button onClick={handleSavePackage} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-1 rounded text-sm">
                    {t.editor.package.save}
                </button>
                
                <div className="h-6 w-px bg-gray-600 mx-2"></div>
                
                {/* Export ZIP */}
                <button onClick={handleExportZip} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1 rounded text-sm flex items-center gap-2">
                    <ArchiveIcon className="w-4 h-4" /> Export .ZIP
                </button>
                
                {/* Import ZIP (Hidden Input) */}
                <input 
                    type="file" 
                    accept=".zip" 
                    ref={importInputRef} 
                    onChange={handleImportZipFile} 
                    className="hidden" 
                />
                <button onClick={handleImportZipClick} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-1 rounded text-sm flex items-center gap-2">
                    <ArchiveIcon className="w-4 h-4" /> Import .ZIP
                </button>
            </div>
            
            <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded ml-4">{t.editor.exit}</button>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-900/50 border-b border-gray-700">
            <button onClick={() => setActiveTab('talents')} className={`px-6 py-3 font-bold ${activeTab === 'talents' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.editor.tabs.talents}</button>
            <button onClick={() => setActiveTab('competitors')} className={`px-6 py-3 font-bold ${activeTab === 'competitors' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.editor.tabs.competitors}</button>
            <button onClick={() => setActiveTab('history')} className={`px-6 py-3 font-bold ${activeTab === 'history' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.editor.tabs.history}</button>
            <button onClick={() => setActiveTab('events')} className={`px-6 py-3 font-bold ${activeTab === 'events' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.editor.tabs.events}</button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 overflow-hidden">
            {activeTab === 'talents' && renderTalentTab()}
            {activeTab === 'competitors' && renderCompetitorsTab()}
            {activeTab === 'history' && renderHistoryTab()}
            {activeTab === 'events' && renderEventsTab()}
        </div>

        {/* PACKAGE MANAGER MODAL */}
        {showManageModal && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowManageModal(false)}>
                <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                        <h2 className="text-xl font-bold font-cinzel text-white">{t.editor.package.manageTitle}</h2>
                        <button onClick={() => setShowManageModal(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {customPackages.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">{t.editor.package.noPackages}</p>
                        ) : (
                            customPackages.map(pkg => (
                                packageToDelete === pkg.id ? (
                                    <div className="bg-red-900/50 p-3 rounded border border-red-500 flex justify-between items-center animate-fade-in">
                                        <span className="text-white font-bold text-sm">{t.editor.package.confirmDelete}</span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => executeDelete(pkg.id)} 
                                                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-500 shadow-md"
                                            >
                                                {t.editor.package.deleteYes}
                                            </button>
                                            <button 
                                                onClick={() => setPackageToDelete(null)} 
                                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-500 shadow-md"
                                            >
                                                {t.editor.package.deleteNo}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={pkg.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded border border-gray-700 hover:border-gray-500">
                                        <div>
                                            <p className="font-bold text-white">{pkg.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(pkg.created).toLocaleDateString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => setPackageToDelete(pkg.id)}
                                            className="bg-red-900/30 hover:bg-red-800 text-red-300 p-2 rounded transition-colors"
                                            title={t.common.delete}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                    
                    <div className="mt-6 text-right">
                         <button onClick={() => setShowManageModal(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-sm">{t.editor.close}</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EditorScreen;
