
import React from 'react';
import { QuizSettings, QuestionSetting } from '../types';

interface SettingsPanelProps {
  settings: QuizSettings;
  setSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
}

const difficultyOptions = ['學前', '小一', '小二', '小三', '小四', '小五', '小六', '國一', '國二', '國三', '高一', '高二', '高三'];

const SettingsRow: React.FC<{
  label: string;
  setting: QuestionSetting;
  onSettingChange: (newSetting: Partial<QuestionSetting>) => void;
}> = ({ label, setting, onSettingChange }) => (
  <div className="p-3 rounded-md transition-colors hover:bg-orange-100">
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        id={`enable-${label}`}
        className="h-5 w-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
        checked={setting.enabled}
        onChange={(e) => onSettingChange({ enabled: e.target.checked })}
      />
      <label htmlFor={`enable-${label}`} className="font-bold text-gray-700 select-none cursor-pointer flex-grow">{label}</label>
    </div>
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pl-9 mt-2 transition-opacity ${setting.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
      <div>
        <label htmlFor={`${label}-count`} className="text-sm font-bold text-gray-600">題數：</label>
        <input
          type="number"
          id={`${label}-count`}
          className="w-20 text-center p-2 border border-orange-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={setting.count}
          min="1"
          max="20"
          disabled={!setting.enabled}
          onChange={(e) => onSettingChange({ count: parseInt(e.target.value, 10) || 1 })}
        />
      </div>
      <div>
        <label htmlFor={`${label}-difficulty`} className="text-sm font-bold text-gray-600">難度：</label>
        <select
          id={`${label}-difficulty`}
          className="p-2 border border-orange-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          value={setting.difficulty}
          disabled={!setting.enabled}
          onChange={(e) => onSettingChange({ difficulty: e.target.value })}
        >
          {difficultyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const handleSettingChange = (key: keyof QuizSettings, newSetting: Partial<QuestionSetting>) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...newSetting }
    }));
  };

  return (
    <div className="mb-8 p-4 bg-orange-50 rounded-lg space-y-4">
      <h3 className="text-xl font-bold text-gray-800">2. 出題設定</h3>
      
      <div className="border border-orange-200 p-3 rounded-lg">
        <h4 className="font-bold text-lg text-stone-800 mb-2">基礎題型</h4>
        <SettingsRow
          label="選擇題"
          setting={settings.comprehension}
          onSettingChange={(s) => handleSettingChange('comprehension', s)}
        />
      </div>

      <div className="border border-orange-200 p-3 rounded-lg">
        <h4 className="font-bold text-lg text-stone-800 mb-2">素養題型</h4>
        <SettingsRow
          label="素養選擇題"
          setting={settings.literacyMC}
          onSettingChange={(s) => handleSettingChange('literacyMC', s)}
        />
        <SettingsRow
          label="素養問答題"
          setting={settings.shortAnswer}
          onSettingChange={(s) => handleSettingChange('shortAnswer', s)}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
