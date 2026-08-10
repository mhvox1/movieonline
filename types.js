var GameState = /* @__PURE__ */ ((GameState2) => {
  GameState2["MainMenu"] = "MainMenu";
  GameState2["NewGame"] = "NewGame";
  GameState2["LoadGame"] = "LoadGame";
  GameState2["MainScreen"] = "MainScreen";
  GameState2["Projects"] = "Projects";
  GameState2["Office"] = "Office";
  GameState2["Research"] = "Research";
  GameState2["Studiogelaende"] = "Studiogelaende";
  GameState2["Finanzen"] = "Finanzen";
  GameState2["Marketing"] = "Marketing";
  GameState2["Settings"] = "Settings";
  GameState2["Privatleben"] = "Privatleben";
  GameState2["CompletedProject"] = "CompletedProject";
  GameState2["Editor"] = "Editor";
  return GameState2;
})(GameState || {});
var GameSpeed = /* @__PURE__ */ ((GameSpeed2) => {
  GameSpeed2["PAUSED"] = "PAUSED";
  GameSpeed2["NORMAL"] = "NORMAL";
  GameSpeed2["FAST"] = "FAST";
  GameSpeed2["FASTER"] = "FASTER";
  GameSpeed2["ULTRA"] = "ULTRA";
  return GameSpeed2;
})(GameSpeed || {});
var ProjectPhase = /* @__PURE__ */ ((ProjectPhase2) => {
  ProjectPhase2["Planning"] = "Planning";
  ProjectPhase2["Scriptwriting"] = "Scriptwriting";
  ProjectPhase2["ScriptFinished"] = "ScriptFinished";
  ProjectPhase2["CastingSetup"] = "CastingSetup";
  ProjectPhase2["Casting"] = "Casting";
  ProjectPhase2["CastingFinished"] = "CastingFinished";
  ProjectPhase2["ProductionSetup"] = "ProductionSetup";
  ProjectPhase2["Production"] = "Production";
  ProjectPhase2["PostProductionSetup"] = "PostProductionSetup";
  ProjectPhase2["PostProduction"] = "PostProduction";
  ProjectPhase2["Completed"] = "Completed";
  return ProjectPhase2;
})(ProjectPhase || {});
var ProjectType = /* @__PURE__ */ ((ProjectType2) => {
  ProjectType2["Movie"] = "movie";
  ProjectType2["Series"] = "series";
  return ProjectType2;
})(ProjectType || {});
var Genre = /* @__PURE__ */ ((Genre2) => {
  Genre2["Action"] = "Action";
  Genre2["Adventure"] = "Abenteuer";
  Genre2["Comedy"] = "Kom\xF6die";
  Genre2["Crime"] = "Krimi";
  Genre2["Dokumentation"] = "Dokumentation";
  Genre2["Drama"] = "Drama";
  Genre2["Fantasy"] = "Fantasy";
  Genre2["Horror"] = "Horror";
  Genre2["Musical"] = "Musical";
  Genre2["Romance"] = "Romanze";
  Genre2["SciFi"] = "Sci-Fi";
  Genre2["Thriller"] = "Thriller";
  Genre2["War"] = "Kriegsfilm";
  Genre2["Western"] = "Western";
  return Genre2;
})(Genre || {});
var BuildingType = /* @__PURE__ */ ((BuildingType2) => {
  BuildingType2["Burogebaude"] = "Burogebaude";
  BuildingType2["Autorenbuero"] = "Autorenbuero";
  BuildingType2["CastingOffice"] = "CastingOffice";
  BuildingType2["MarketingDepartment"] = "MarketingDepartment";
  BuildingType2["ResearchLab"] = "ResearchLab";
  BuildingType2["Planungsbuero"] = "Planungsbuero";
  BuildingType2["Studio"] = "Studio";
  BuildingType2["Studio1"] = "Studio1";
  BuildingType2["Studio2"] = "Studio2";
  BuildingType2["Studio3"] = "Studio3";
  BuildingType2["Bauhof"] = "Bauhof";
  BuildingType2["Kino"] = "Kino";
  BuildingType2["Restaurant"] = "Restaurant";
  BuildingType2["Filmmuseum"] = "Filmmuseum";
  BuildingType2["Backlot"] = "Backlot";
  BuildingType2["Postproduktionshaus"] = "Postproduktionshaus";
  BuildingType2["Sicherheitszentrale"] = "Sicherheitszentrale";
  BuildingType2["KostuemUndMaskenatelier"] = "KostuemUndMaskenatelier";
  BuildingType2["Betriebskita"] = "Betriebskita";
    BuildingType2["Studiohotel"] = "Studiohotel";
    BuildingType2["Eventhalle"] = "Eventhalle";
    BuildingType2["Fanshop"] = "Fanshop";
  return BuildingType2;
})(BuildingType || {});
var EmployeeType = /* @__PURE__ */ ((EmployeeType2) => {
  EmployeeType2["Autor"] = "Autor";
  EmployeeType2["CastingMitarbeiter"] = "CastingMitarbeiter";
  EmployeeType2["Forscher"] = "Forscher";
  EmployeeType2["Marketingmanager"] = "Marketingmanager";
  EmployeeType2["ProjektPlaner"] = "ProjektPlaner";
  return EmployeeType2;
})(EmployeeType || {});
var TalentTrait = /* @__PURE__ */ ((TalentTrait2) => {
  TalentTrait2["Publikumsliebling"] = "Publikumsliebling";
  TalentTrait2["Sparfuchs"] = "Sparfuchs";
  TalentTrait2["Teamplayer"] = "Teamplayer";
  TalentTrait2["Arbeitstier"] = "Arbeitstier";
  TalentTrait2["UnentdecktesJuwel"] = "Unentdecktes Juwel";
  TalentTrait2["Diva"] = "Diva";
  TalentTrait2["Perfektionist"] = "Perfektionist";
  TalentTrait2["Unzuverl\xE4ssig"] = "Unzuverl\xE4ssig";
  TalentTrait2["Kassengift"] = "Kassengift";
  return TalentTrait2;
})(TalentTrait || {});
var MaritalStatus = /* @__PURE__ */ ((MaritalStatus2) => {
  MaritalStatus2["Single"] = "Single";
  MaritalStatus2["Acquaintance"] = "Bekanntschaft";
  MaritalStatus2["Dating"] = "In einer Beziehung";
  MaritalStatus2["Engaged"] = "Verlobt";
  MaritalStatus2["Married"] = "Verheiratet";
  MaritalStatus2["Divorced"] = "Geschieden";
  MaritalStatus2["Widowed"] = "Verwitwet";
  return MaritalStatus2;
})(MaritalStatus || {});
var ActorAge = /* @__PURE__ */ ((ActorAge2) => {
  ActorAge2["Child"] = "Kind";
  ActorAge2["Young"] = "Jung";
  ActorAge2["MiddleAged"] = "Mittelalt";
  ActorAge2["Old"] = "Alt";
  return ActorAge2;
})(ActorAge || {});
var MovieSize = /* @__PURE__ */ ((MovieSize2) => {
  MovieSize2["B"] = "B-Movie";
  MovieSize2["BPlus"] = "B+ Movie";
  MovieSize2["A"] = "A-Movie";
  MovieSize2["AA"] = "AA-Movie";
  MovieSize2["AAA"] = "AAA-Movie";
  return MovieSize2;
})(MovieSize || {});
var Era = /* @__PURE__ */ ((Era2) => {
  Era2["Ancient"] = "Antike";
  Era2["Medieval"] = "Mittelalter";
  Era2["Present"] = "Gegenwart";
  Era2["Future"] = "Zukunft";
  return Era2;
})(Era || {});
var AgeRating = /* @__PURE__ */ ((AgeRating2) => {
  AgeRating2["FSK0"] = "0";
  AgeRating2["FSK6"] = "6";
  AgeRating2["FSK12"] = "12";
  AgeRating2["FSK16"] = "16";
  AgeRating2["FSK18"] = "18";
  return AgeRating2;
})(AgeRating || {});
var ResearchTree = /* @__PURE__ */ ((ResearchTree2) => {
  ResearchTree2["Vorproduktion"] = "Vorproduktion";
  ResearchTree2["Genres"] = "Genres";
  ResearchTree2["Production"] = "Produktion";
  ResearchTree2["Marketing"] = "Marketing";
  ResearchTree2["Management"] = "Management";
  return ResearchTree2;
})(ResearchTree || {});
export {
  ActorAge,
  AgeRating,
  BuildingType,
  EmployeeType,
  Era,
  GameSpeed,
  GameState,
  Genre,
  MaritalStatus,
  MovieSize,
  ProjectPhase,
  ProjectType,
  ResearchTree,
  TalentTrait
};
