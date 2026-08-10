import React, { useState, useMemo, useEffect, useRef } from 'react';
import { newGameBackgroundImage } from './backgrounds/NewGameBackgroundImage';
import { useTranslation } from '../hooks/useTranslation';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import FolderIcon from './icons/FolderIcon';
import { generateRandomPortraitSet } from './portraits';
import { useGame } from '../contexts/GameContext';

const TOTAL_POINTS = 100;

const SkillSlider = ({ label, value, onChange, tooltip, disabled }) => (
  <div className="relative group">
    <label className="block text-sm font-medium text-gray-300 mb-1 tracking-wider flex justify-between">
      <span>{label}</span>
      <span className="font-bold text-amber-400">{value} / 100</span>
    </label>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
    />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      {tooltip}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
    </div>
  </div>
);

const NewGameScreen = ({ onStart, onBack, requiresAccountRegistration = false }) => {
  const { t } = useTranslation();
  const { gameRelease } = useGame();

  const [firstName, setFirstName] = useState(gameRelease ? '' : 'Max');
  const [lastName, setLastName] = useState(gameRelease ? '' : 'Mustermann');
  const [studioName, setStudioName] = useState(gameRelease ? '' : 'Teststudio');
  const [gender, setGender] = useState('männlich');

  const [birthDay, setBirthDay] = useState(1);
  const [birthMonth, setBirthMonth] = useState(0);

  const [availablePortraits, setAvailablePortraits] = useState([]);
  const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0);
  const [customPortrait, setCustomPortrait] = useState(null);
  const fileInputRef = useRef(null);

  const [tutorialEnabled, setTutorialEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');

  const [error, setError] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');

  const [negotiationSkill, setNegotiationSkill] = useState(gameRelease ? 0 : 20);
  const [charisma, setCharisma] = useState(gameRelease ? 0 : 20);
  const [financialSense, setFinancialSense] = useState(gameRelease ? 0 : 20);
  const [filmSense, setFilmSense] = useState(gameRelease ? 0 : 20);
  const [organizationTalent, setOrganizationTalent] = useState(gameRelease ? 0 : 20);

  const usedPoints = useMemo(
    () => negotiationSkill + charisma + financialSense + filmSense + organizationTalent,
    [negotiationSkill, charisma, financialSense, filmSense, organizationTalent]
  );
  const remainingPoints = TOTAL_POINTS - usedPoints;
  const months = t.monthlyReport.months;

  useEffect(() => {
    const genderKey = gender === 'männlich' ? 'male' : 'female';
    const randomSubset = generateRandomPortraitSet(genderKey, 25);
    setAvailablePortraits(randomSubset);
    setCurrentPortraitIndex(0);
    setCustomPortrait(null);
  }, [gender]);

  const handlePrevPortrait = () => {
    setCustomPortrait(null);
    setCurrentPortraitIndex(prev => (prev === 0 ? availablePortraits.length - 1 : prev - 1));
  };

  const handleNextPortrait = () => {
    setCustomPortrait(null);
    setCurrentPortraitIndex(prev => (prev === availablePortraits.length - 1 ? 0 : prev + 1));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPortrait(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStartClick = () => {
    if (firstName.trim() === '' || lastName.trim() === '' || studioName.trim() === '') {
      setError(t.newGame.errorMissingFields);
      return;
    }
    if (remainingPoints !== 0) {
      setError(t.newGame.errorPoints);
      return;
    }

    if (requiresAccountRegistration) {
      if (!registerEmail.includes('@')) {
        setError('Bitte eine gueltige E-Mail eingeben.');
        return;
      }
      if (registerPassword.length < 8) {
        setError('Das Passwort muss mindestens 8 Zeichen haben.');
        return;
      }
      if (registerUsername.trim().length < 3) {
        setError('Der Nutzername muss mindestens 3 Zeichen haben.');
        return;
      }
    }

    setError('');
    const finalPortraitId = customPortrait || availablePortraits[currentPortraitIndex];

    onStart({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studioName,
      gender,
      birthDay,
      birthMonth,
      playerPortraitId: finalPortraitId,
      negotiationSkill,
      charisma,
      financialSense,
      filmSense,
      organizationTalent,
      tutorialEnabled,
      difficulty,
      accountRegistration: requiresAccountRegistration
        ? {
            email: registerEmail.trim(),
            password: registerPassword,
            username: registerUsername.trim(),
          }
        : undefined,
    });
  };

  const handleSliderChange = (setter, ...otherValues) => (e) => {
    const value = parseInt(e.target.value, 10);
    const sumOfOthers = otherValues.reduce((sum, val) => sum + val, 0);
    if (value + sumOfOthers <= TOTAL_POINTS) {
      setter(value);
    }
  };

  return (
    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${newGameBackgroundImage})` }}>
      <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-0 p-8 overflow-y-auto">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-700 my-auto">
          <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">{t.newGame.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {requiresAccountRegistration && (
                <div className="bg-gray-900/50 border border-amber-600/50 rounded-md p-3 space-y-3">
                  <h4 className="text-amber-300 font-bold">Account Registrierung</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nutzername</label>
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={e => setRegisterUsername(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Nutzername"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Passwort</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Mindestens 8 Zeichen"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tracking-wider text-center">{t.newGame.gender}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('männlich')}
                    className={`w-full py-2 px-4 rounded-md transition-colors font-bold text-2xl ${
                      gender === 'männlich' ? 'bg-amber-500 text-gray-900 ring-2 ring-amber-300' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    ♂
                  </button>
                  <button
                    onClick={() => setGender('weiblich')}
                    className={`w-full py-2 px-4 rounded-md transition-colors font-bold text-2xl ${
                      gender === 'weiblich' ? 'bg-amber-500 text-gray-900 ring-2 ring-amber-300' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    ♀
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 my-4">
                <button onClick={handlePrevPortrait} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white transition-colors">
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>

                <div className="relative">
                  <div className="w-32 h-32 bg-gray-700 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg">
                    {customPortrait ? (
                      <img src={customPortrait} alt={t.newGame.customPortraitAlt} className="w-full h-full object-cover" />
                    ) : (
                      availablePortraits.length > 0 && (
                        <img
                          src={`https://www.schnoxcore.com/media/portraits/${availablePortraits[currentPortraitIndex]}j.png`}
                          alt={t.newGame.playerPortraitAlt}
                          className="w-full h-full object-cover"
                        />
                      )
                    )}
                  </div>

                  <div
                    className="absolute bottom-0 -right-2 p-2 bg-gray-800 hover:bg-amber-600 rounded-full cursor-pointer transition-colors border-2 border-gray-600 shadow-md flex items-center justify-center z-10"
                    onClick={handleUploadClick}
                    title={t.newGame.uploadCustomImage}
                  >
                    <FolderIcon className="w-4 h-4 text-white" />
                  </div>

                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>

                <button onClick={handleNextPortrait} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white transition-colors">
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 mb-2">
                {customPortrait ? t.newGame.customImage : `${currentPortraitIndex + 1} / ${availablePortraits.length}`}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{t.newGame.firstName}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder={!gameRelease ? 'Steven' : ''}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{t.newGame.lastName}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder={!gameRelease ? 'Spielberg' : ''}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 tracking-wider">{t.newGame.studioName}</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder={!gameRelease ? 'DreamWorks' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tracking-wider">{t.newGame.birthDate}</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={birthDay}
                    onChange={e => setBirthDay(Number(e.target.value))}
                    className="bg-gray-900 border border-gray-600 rounded-md py-2 px-1 text-white text-sm"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        {d}.
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthMonth}
                    onChange={e => setBirthMonth(Number(e.target.value))}
                    className="bg-gray-900 border border-gray-600 rounded-md py-2 px-1 text-white text-sm"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic text-center">{t.newGame.startAgeHint}</p>
              </div>
            </div>

            <div className="border-l border-gray-700 pl-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-center mb-2 font-cinzel text-amber-300">{t.newGame.skillsTitle}</h3>
                <div className="bg-gray-900/50 p-3 rounded-md text-center mb-4">
                  <p className="text-lg font-bold">
                    {t.newGame.remainingPoints}: <span className={remainingPoints === 0 ? 'text-green-400' : 'text-amber-400'}>{remainingPoints}</span>
                  </p>
                </div>
                <div className="space-y-4">
                  <SkillSlider
                    label={t.newGame.skillNegotiation}
                    value={negotiationSkill}
                    onChange={handleSliderChange(setNegotiationSkill, charisma, financialSense, filmSense, organizationTalent)}
                    tooltip={t.newGame.skillNegotiationTooltip}
                  />
                  <SkillSlider
                    label={t.newGame.skillCharisma}
                    value={charisma}
                    onChange={handleSliderChange(setCharisma, negotiationSkill, financialSense, filmSense, organizationTalent)}
                    tooltip={t.newGame.skillCharismaTooltip}
                  />
                  <SkillSlider
                    label={t.newGame.skillFinance}
                    value={financialSense}
                    onChange={handleSliderChange(setFinancialSense, negotiationSkill, charisma, filmSense, organizationTalent)}
                    tooltip={t.newGame.skillFinanceTooltip}
                  />
                  <SkillSlider
                    label={t.newGame.skillFilmSense}
                    value={filmSense}
                    onChange={handleSliderChange(setFilmSense, negotiationSkill, charisma, financialSense, organizationTalent)}
                    tooltip={t.newGame.skillFilmSenseTooltip}
                  />
                  <SkillSlider
                    label={t.newGame.skillOrganization}
                    value={organizationTalent}
                    onChange={handleSliderChange(setOrganizationTalent, negotiationSkill, charisma, financialSense, filmSense)}
                    tooltip={t.newGame.skillOrganizationTooltip}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1 tracking-wider">{t.newGame.difficulty}</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="leicht">{t.newGame.difficultyEasy}</option>
                    <option value="normal">{t.newGame.difficultyNormal}</option>
                    <option value="schwer">{t.newGame.difficultyHard}</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded bg-gray-800/50 hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={tutorialEnabled}
                    onChange={e => setTutorialEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors">{t.newGame.tutorialEnable}</span>
                    <span className="text-xs text-gray-400">{t.newGame.tutorialEnableDesc}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center mt-6 font-bold bg-red-900/20 py-2 rounded">{error}</p>}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onBack}
              className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-gray-500 transition-all duration-300 ease-in-out"
            >
              {t.common.back}
            </button>
            <button
              onClick={handleStartClick}
              disabled={remainingPoints !== 0}
              className="w-full bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {t.newGame.start}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGameScreen;
