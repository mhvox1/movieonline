import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { settingsBackgroundImage } from "./backgrounds/SettingsBackgroundImage";
import EinstellungenIcon from "./icons/EinstellungenIcon";
import QuitIcon from "./icons/QuitIcon";
import { useGame } from "../contexts/GameContext";
import GameHeader from "./GameHeader";
import { useTranslation } from "../hooks/useTranslation";
import BugIcon from "./icons/BugIcon";
import BetaFeedbackModal from "./BetaFeedbackModal";
const SETTINGS_KEY = "film_tycoon_settings";
const SettingsButton = ({ title, description, icon, isActive, disabled, onClick, textColor }) => {
  const activeClasses = "border-amber-500 ring-2 ring-amber-500 bg-gray-700/50";
  const defaultClasses = "border-gray-700 hover:border-amber-500/50 hover:-translate-y-1";
  const disabledClasses = "opacity-50 cursor-not-allowed hover:-translate-y-0";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      className: `bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses} ${disabled ? disabledClasses : ""}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && "bg-amber-500"}`, children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: `text-md font-bold font-cinzel ${textColor || (isActive ? "text-amber-300" : "text-amber-400")} group-hover:text-amber-300 transition-colors`, children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })
        ] })
      ] })
    }
  );
};
const OptionsTabButton = ({ title, isActive, onClick }) => /* @__PURE__ */ jsx(
  "button",
  {
    onClick,
    className: `py-2 px-6 font-bold text-lg transition-colors duration-200 ${isActive ? "text-amber-400 border-b-2 border-amber-400" : "text-gray-400 hover:text-white"}`,
    children: title
  }
);
const SettingsScreen = ({ onBack, onQuit, gameSpeed, setGameSpeed }) => {
  const { t, language } = useTranslation();
  const {
    playerData,
    masterVolume,
    setMasterVolume,
    musicVolume,
    setMusicVolume,
    effectsVolume,
    setEffectsVolume,
    isMuted,
    setIsMuted,
    isRightClickToMainScreenEnabled,
    setIsRightClickToMainScreenEnabled,
    showWeeklyNewspaper,
    setShowWeeklyNewspaper,
    jumpToNewsOnMessage,
    setJumpToNewsOnMessage,
    pauseOnMessage,
    setPauseOnMessage,
    setLanguage,
    scalingMode,
    setScalingMode,
    betaVersion,
    activeDataPackage,
    setActiveDataPackage,
    customPackages,
    editorEnabled
  } = useGame();
  const [activeTab, setActiveTab] = useState("options");
  const [optionsTab, setOptionsTab] = useState("spiel");
  const [manualTab, setManualTab] = useState("production");
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const preMuteVolumes = useRef({ master: masterVolume, music: musicVolume, effects: effectsVolume });
  useEffect(() => {
    if (!playerData) {
      if (showQuitConfirm) setShowQuitConfirm(false);
    }
  }, [playerData, showQuitConfirm]);
  const handleMuteToggle = (e) => {
    const checked = e.target.checked;
    setIsMuted(checked);
    if (checked) {
      preMuteVolumes.current = { master: masterVolume, music: musicVolume, effects: effectsVolume };
      setMasterVolume(0);
      setMusicVolume(0);
      setEffectsVolume(0);
    } else {
      setMasterVolume(preMuteVolumes.current.master > 0 ? preMuteVolumes.current.master : 8);
      setMusicVolume(preMuteVolumes.current.music > 0 ? preMuteVolumes.current.music : 6);
      setEffectsVolume(preMuteVolumes.current.effects > 0 ? preMuteVolumes.current.effects : 7);
    }
  };
  useEffect(() => {
    if (masterVolume > 0 || musicVolume > 0 || effectsVolume > 0) {
      if (isMuted) setIsMuted(false);
    } else {
      if (!isMuted) setIsMuted(true);
    }
  }, [masterVolume, musicVolume, effectsVolume, isMuted, setIsMuted]);
  const renderContent = () => {
    if (activeTab === "options") {
      return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: t.settings.options }),
        /* @__PURE__ */ jsxs("div", { className: "flex mb-6 border-b border-gray-600 flex-shrink-0 justify-center gap-4", children: [
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.gameTab, isActive: optionsTab === "spiel", onClick: () => setOptionsTab("spiel") }),
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.graphicsTab, isActive: optionsTab === "grafik", onClick: () => setOptionsTab("grafik") }),
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.soundTab, isActive: optionsTab === "sound", onClick: () => setOptionsTab("sound") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-grow overflow-y-auto pr-4 text-gray-300 custom-scrollbar", children: [
          optionsTab === "grafik" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-md mx-auto", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-cinzel text-amber-300 mb-4 text-center", children: t.settings.graphicsTab }),
            /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "scaling-mode", className: "font-semibold cursor-pointer text-white", children: t.settings.displayMode }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "scaling-mode",
                  value: scalingMode,
                  onChange: (e) => setScalingMode(e.target.value),
                  className: "bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "maintain-ratio", children: t.settings.maintainRatio }),
                    /* @__PURE__ */ jsx("option", { value: "stretch", children: t.settings.stretch })
                  ]
                }
              )
            ] })
          ] }),
          optionsTab === "sound" && /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-md mx-auto", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-cinzel text-amber-300 mb-4 text-center", children: t.settings.soundTab }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-white font-semibold", children: t.settings.volumeMaster }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "0" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: "0", max: "10", value: masterVolume, onChange: (e) => setMasterVolume(Number(e.target.value)), className: "w-full accent-amber-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "10" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-white font-semibold", children: t.settings.volumeMusic }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "0" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: "0", max: "10", value: musicVolume, onChange: (e) => setMusicVolume(Number(e.target.value)), className: "w-full accent-amber-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "10" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-white font-semibold", children: t.settings.volumeEffects }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "0" }),
                /* @__PURE__ */ jsx("input", { type: "range", min: "0", max: "10", value: effectsVolume, onChange: (e) => setEffectsVolume(Number(e.target.value)), className: "w-full accent-amber-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 w-2 text-center", children: "10" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4 flex items-center justify-end gap-2 border-t border-gray-700", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "mute-checkbox",
                  checked: isMuted,
                  onChange: handleMuteToggle,
                  className: "h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "mute-checkbox", className: "text-white cursor-pointer", children: t.settings.mute })
            ] })
          ] }),
          optionsTab === "spiel" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-md mx-auto", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-cinzel text-amber-300 mb-4 text-center", children: t.settings.gameTab }),
            !playerData && /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "language-select", className: "font-semibold cursor-pointer text-white", children: t.settings.language }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "language-select",
                  value: language,
                  onChange: (e) => setLanguage(e.target.value),
                  className: "bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "de", children: "Deutsch" }),
                    /* @__PURE__ */ jsx("option", { value: "en", children: "English" })
                  ]
                }
              )
            ] }),
            !playerData && editorEnabled && /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "data-package-select", className: "font-semibold cursor-pointer text-white", children: t.settings.dataSource }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.settings.dataSourceDesc })
              ] }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "data-package-select",
                  value: activeDataPackage,
                  onChange: (e) => setActiveDataPackage(e.target.value),
                  className: "bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer max-w-[200px]",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Original", children: "Original" }),
                    customPackages.map((pkg) => /* @__PURE__ */ jsx("option", { value: pkg.id, children: pkg.name }, pkg.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "right-click-menu", className: "font-semibold cursor-pointer text-white", children: t.settings.rightClickMenu }),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700", children: [
                t.settings.rightClickMenuTooltip,
                /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700" })
              ] }),
              /* @__PURE__ */ jsxs("label", { htmlFor: "right-click-menu", className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "right-click-menu",
                    checked: isRightClickToMainScreenEnabled,
                    onChange: (e) => setIsRightClickToMainScreenEnabled(e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "weekly-newspaper", className: "font-semibold cursor-pointer text-white", children: t.settings.weeklyNewspaper }),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700", children: [
                t.settings.weeklyNewspaperTooltip,
                /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700" })
              ] }),
              /* @__PURE__ */ jsxs("label", { htmlFor: "weekly-newspaper", className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "weekly-newspaper",
                    checked: showWeeklyNewspaper,
                    onChange: (e) => setShowWeeklyNewspaper(e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "jump-to-news", className: "font-semibold cursor-pointer text-white", children: t.settings.jumpToNews }),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700", children: [
                t.settings.jumpToNewsTooltip,
                /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700" })
              ] }),
              /* @__PURE__ */ jsxs("label", { htmlFor: "jump-to-news", className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "jump-to-news",
                    checked: jumpToNewsOnMessage,
                    onChange: (e) => setJumpToNewsOnMessage(e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "pause-on-message", className: "font-semibold cursor-pointer text-white", children: t.settings.pauseOnMessage }),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700", children: [
                t.settings.pauseOnMessageTooltip,
                /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700" })
              ] }),
              /* @__PURE__ */ jsxs("label", { htmlFor: "pause-on-message", className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "pause-on-message",
                    checked: pauseOnMessage,
                    onChange: (e) => setPauseOnMessage(e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" })
              ] })
            ] })
          ] })
        ] })
      ] });
    }
    if (activeTab === "manual") {
      return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col max-w-5xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: t.settings.manualTab }),
        /* @__PURE__ */ jsxs("div", { className: "flex mb-6 border-b border-gray-600 flex-shrink-0 justify-center gap-4", children: [
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.manual.tabs.production, isActive: manualTab === "production", onClick: () => setManualTab("production") }),
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.manual.tabs.studio, isActive: manualTab === "studio", onClick: () => setManualTab("studio") }),
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.manual.tabs.finance, isActive: manualTab === "finance", onClick: () => setManualTab("finance") }),
          /* @__PURE__ */ jsx(OptionsTabButton, { title: t.settings.manual.tabs.privatelife, isActive: manualTab === "privatelife", onClick: () => setManualTab("privatelife") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-grow overflow-y-auto pr-4 text-gray-300 custom-scrollbar", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-3xl mx-auto text-gray-300 bg-gray-800/50 p-6 rounded-md border border-gray-600", children: [
          manualTab === "production" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2", children: t.settings.manual.production.title }),
            /* @__PURE__ */ jsx("p", { className: "mb-6 italic", children: t.settings.manual.production.intro }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.production.script }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.production.casting }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.production.filming }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.production.post }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.production.release })
            ] })
          ] }),
          manualTab === "studio" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2", children: t.settings.manual.studio.title }),
            /* @__PURE__ */ jsx("p", { className: "mb-6 italic", children: t.settings.manual.studio.intro }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.studio.buildings }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.studio.employees }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.studio.research })
            ] })
          ] }),
          manualTab === "finance" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2", children: t.settings.manual.finance.title }),
            /* @__PURE__ */ jsx("p", { className: "mb-6 italic", children: t.settings.manual.finance.intro }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.finance.banking }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.finance.stock }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.finance.marketing })
            ] })
          ] }),
          manualTab === "privatelife" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2", children: t.settings.manual.privatelife.title }),
            /* @__PURE__ */ jsx("p", { className: "mb-6 italic", children: t.settings.manual.privatelife.intro }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.privatelife.energy }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.privatelife.relationships }),
              /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm whitespace-pre-line", children: t.settings.manual.privatelife.assets })
            ] })
          ] })
        ] }) })
      ] });
    }
    return null;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "w-full h-full bg-cover bg-center flex flex-col",
      style: { backgroundImage: `url(${settingsBackgroundImage})` },
      children: [
        /* @__PURE__ */ jsx(GameHeader, { gameSpeed, setGameSpeed, disabled: true }),
        /* @__PURE__ */ jsxs("div", { className: "flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("aside", { className: "w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col", children: [
            /* @__PURE__ */ jsx("header", { className: "p-6 text-center border-b border-gray-700", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold font-cinzel text-amber-400", children: t.settings.title }) }),
            /* @__PURE__ */ jsxs("nav", { className: "flex-grow p-4 flex flex-col gap-4 overflow-y-auto", children: [
              /* @__PURE__ */ jsx(
                SettingsButton,
                {
                  title: t.settings.options,
                  description: t.settings.options,
                  icon: /* @__PURE__ */ jsx(EinstellungenIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
                  isActive: activeTab === "options",
                  onClick: () => setActiveTab("options")
                }
              ),
              playerData && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-600/50", children: [
                /* @__PURE__ */ jsx(
                  SettingsButton,
                  {
                    title: t.settings.quitGame,
                    description: t.settings.quitGame,
                    icon: /* @__PURE__ */ jsx(QuitIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
                    isActive: false,
                    onClick: () => setShowQuitConfirm(true)
                  }
                ),
                betaVersion && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
                  SettingsButton,
                  {
                    title: t.beta.reportError,
                    description: t.beta.reportErrorDesc,
                    icon: /* @__PURE__ */ jsx(BugIcon, { className: "h-5 w-5 bg-red-400 group-hover:bg-black transition-colors" }),
                    isActive: false,
                    onClick: () => setShowBetaModal(true),
                    textColor: "text-red-500"
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("footer", { className: "p-4 border-t border-gray-700", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onBack,
                className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase",
                children: playerData ? t.settings.backToGame : t.settings.backToMenu
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("main", { className: "flex-grow p-8 overflow-y-auto bg-black/40 backdrop-blur-sm", children: renderContent() })
        ] }),
        showQuitConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.settings.quitGameTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.settings.quitGameText }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setShowQuitConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
            /* @__PURE__ */ jsx("button", { onClick: onQuit, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.settings.quitGameYes })
          ] })
        ] }) }),
        showBetaModal && /* @__PURE__ */ jsx(BetaFeedbackModal, { onClose: () => setShowBetaModal(false) })
      ]
    }
  );
};
var SettingsScreen_default = SettingsScreen;
export {
  SettingsScreen_default as default
};
