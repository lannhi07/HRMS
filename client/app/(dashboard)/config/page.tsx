'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
interface ConfigRow {
  key: string;
  value: string;
  label: string;
  description: string;
  category: string;
  updatedAt: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
const categoryOrder = ['Chấm Công', 'Lương', 'Bảo Hiểm', 'Thuế TNCN', 'Bậc Thuế TNCN'];
export default function ConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user && user.role !== 'hrro') {
      router.push('/dashboard');
    }
  }, [user, router]);
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<ConfigRow[]>>('/config');
      setConfigs(res.data || []);
      setEdited({});
    } catch (error) {
      console.error('Lỗi Tải Cấu Hình:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchConfigs(); }, []);
  const handleChange = (key: string, value: string) => {
    setEdited(prev => ({ ...prev, [key]: value }));
  };
  const getValue = (row: ConfigRow) => edited[row.key] ?? row.value;
  const handleSave = async () => {
    const updates = Object.entries(edited).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) return;
    try {
      setSaving(true);
      await api.put('/config', updates);
      await fetchConfigs();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Lỗi');
    } finally {
      setSaving(false);
    }
  };
  const grouped = categoryOrder.reduce<Record<string, ConfigRow[]>>((acc, cat) => {
    const items = configs.filter(c => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});
  const remaining = configs.filter(c => !categoryOrder.includes(c.category));
  if (remaining.length > 0) {
    remaining.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });
  }
  const hasChanges = Object.keys(edited).length > 0;
  return (
    <>
      <Header title="Cấu Hình Hệ Thống" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-gray-900">Thông Số Hệ Thống</h2>
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save size={16} />
            {saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-green-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, rows]) => (
              <div key={category} className="bg-white rounded shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">{category}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {rows.map(row => (
                    <div key={row.key} className="px-6 py-4 flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{row.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{row.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          className={`w-40 px-3 py-2 text-sm border rounded bg-white focus:outline-none focus:border-green-700 text-right ${edited[row.key] !== undefined ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                          value={getValue(row)}
                          onChange={e => handleChange(row.key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {hasChanges && (
          <div className="fixed bottom-6 right-6">
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm rounded shadow-lg cursor-pointer bg-green-950 text-white border border-green-950 hover:bg-white hover:text-green-950 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Đang Lưu...' : `Lưu ${Object.keys(edited).length} Thay Đổi`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}