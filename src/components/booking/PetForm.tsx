import type { PetSpecies } from '@/types';
import { cn } from '@/lib/utils';

export interface PetFormData {
  name: string;
  species: PetSpecies | '';
  breed: string;
  age: string;
  weight: string;
  gender: 'male' | 'female' | '';
  vaccineRecords: string[];
  notes: string;
}

interface PetFormProps {
  formData: PetFormData;
  onChange: (data: Partial<PetFormData>) => void;
}

const speciesOptions: { value: PetSpecies; label: string; emoji: string }[] = [
  { value: 'dog', label: '狗狗', emoji: '🐕' },
  { value: 'cat', label: '猫咪', emoji: '🐱' },
  { value: 'other', label: '其他', emoji: '🐾' },
];

const genderOptions: { value: 'male' | 'female'; label: string; icon: string }[] = [
  { value: 'male', label: '公', icon: '♂' },
  { value: 'female', label: '母', icon: '♀' },
];

const vaccineOptions = [
  { value: 'rabies', label: '狂犬疫苗', desc: '预防狂犬病' },
  { value: 'core', label: '三联/五联', desc: '核心疫苗接种' },
  { value: 'deworm', label: '驱虫证明', desc: '体内外驱虫' },
  { value: 'other', label: '其他', desc: '其他疫苗证明' },
];

export default function PetForm({ formData, onChange }: PetFormProps) {
  const handleVaccineToggle = (value: string) => {
    const current = formData.vaccineRecords || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ vaccineRecords: updated });
  };

  const inputClass = cn(
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900',
    'placeholder:text-gray-400 transition-all duration-200',
    'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
    'hover:border-gray-300'
  );

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">宠物信息</h3>
        <p className="text-sm text-gray-500">请填写您爱宠的基本信息</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>宠物名字 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="例如：豆豆、咪咪"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>宠物类型 *</label>
          <div className="grid grid-cols-3 gap-2">
            {speciesOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ species: opt.value })}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-200',
                  formData.species === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>品种</label>
          <input
            type="text"
            value={formData.breed}
            onChange={(e) => onChange({ breed: e.target.value })}
            placeholder="例如：金毛、英短"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>年龄 (岁)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={formData.age}
            onChange={(e) => onChange({ age: e.target.value })}
            placeholder="例如：2.5"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>体重 (kg)</label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            placeholder="例如：12.5"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>性别</label>
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ gender: opt.value })}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all duration-200',
                  formData.gender === opt.value
                    ? opt.value === 'male'
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className={labelClass}>疫苗记录 (多选)</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {vaccineOptions.map((opt) => {
            const checked = formData.vaccineRecords?.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                  checked
                    ? 'border-forest-400 bg-forest-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    checked
                      ? 'bg-forest-500 border-forest-500'
                      : 'bg-white border-gray-300'
                  )}
                >
                  {checked && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => handleVaccineToggle(opt.value)}
                />
                <div>
                  <div
                    className={cn(
                      'text-sm font-medium',
                      checked ? 'text-forest-700' : 'text-gray-700'
                    )}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className={labelClass}>特殊注意事项</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={4}
          placeholder="例如：对鸡肉过敏、性格胆小、需要按时服药等"
          className={cn(
            inputClass,
            'resize-none py-3 min-h-[100px]'
          )}
        />
        <p className="mt-1.5 text-xs text-gray-400">请告知任何可能影响照顾宠物的信息</p>
      </div>
    </div>
  );
}
