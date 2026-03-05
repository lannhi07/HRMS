import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';
import db from '../database/connection.js';
const defaultConfigs: { key: string; value: string; label: string; description: string; category: string }[] = [
  { key: 'workStartTime', value: '08:30', label: 'Giờ Vào Làm', description: 'Giờ Bắt Đầu Làm Việc (HH:MM)', category: 'Chấm Công' },
  { key: 'workEndTime', value: '17:30', label: 'Giờ Tan Làm', description: 'Giờ Kết Thúc Làm Việc (HH:MM)', category: 'Chấm Công' },
  { key: 'lunchBreakMinutes', value: '60', label: 'Thời Gian Nghỉ Trưa (Phút)', description: 'Số Phút Nghỉ Trưa Trừ Vào Giờ Công', category: 'Chấm Công' },
  { key: 'overtimeMultiplier', value: '1.5', label: 'Hệ Số Tăng Ca', description: 'Hệ Số Nhân Lương Giờ Khi Làm Thêm Giờ', category: 'Lương' },
  { key: 'siRate', value: '8', label: 'Tỷ Lệ BHXH (%)', description: 'Tỷ Lệ Đóng Bảo Hiểm Xã Hội Của Người Lao Động', category: 'Bảo Hiểm' },
  { key: 'hiRate', value: '1.5', label: 'Tỷ Lệ BHYT (%)', description: 'Tỷ Lệ Đóng Bảo Hiểm Y Tế Của Người Lao Động', category: 'Bảo Hiểm' },
  { key: 'uiRate', value: '1', label: 'Tỷ Lệ BHTN (%)', description: 'Tỷ Lệ Đóng Bảo Hiểm Thất Nghiệp Của Người Lao Động', category: 'Bảo Hiểm' },
  { key: 'maxSalaryForInsurance', value: '36000000', label: 'Mức Lương Tối Đa Đóng BH (VNĐ)', description: 'Mức Lương Trần Để Tính Đóng Bảo Hiểm', category: 'Bảo Hiểm' },
  { key: 'personalDeduction', value: '11000000', label: 'Giảm Trừ Bản Thân (VNĐ)', description: 'Mức Giảm Trừ Gia Cảnh Bản Thân Cho Thuế TNCN', category: 'Thuế TNCN' },
  { key: 'dependentDeduction', value: '4400000', label: 'Giảm Trừ Người Phụ Thuộc (VNĐ)', description: 'Mức Giảm Trừ Cho Mỗi Người Phụ Thuộc', category: 'Thuế TNCN' },
  { key: 'pitBracket1Limit', value: '5000000', label: 'Bậc 1 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 1', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket1Rate', value: '5', label: 'Bậc 1 - Thuế Suất (%)', description: 'Thuế Suất Bậc 1', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket2Limit', value: '10000000', label: 'Bậc 2 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 2', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket2Rate', value: '10', label: 'Bậc 2 - Thuế Suất (%)', description: 'Thuế Suất Bậc 2', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket3Limit', value: '18000000', label: 'Bậc 3 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 3', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket3Rate', value: '15', label: 'Bậc 3 - Thuế Suất (%)', description: 'Thuế Suất Bậc 3', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket4Limit', value: '32000000', label: 'Bậc 4 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 4', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket4Rate', value: '20', label: 'Bậc 4 - Thuế Suất (%)', description: 'Thuế Suất Bậc 4', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket5Limit', value: '52000000', label: 'Bậc 5 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 5', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket5Rate', value: '25', label: 'Bậc 5 - Thuế Suất (%)', description: 'Thuế Suất Bậc 5', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket6Limit', value: '80000000', label: 'Bậc 6 - Giới Hạn (VNĐ)', description: 'Giới Hạn Trên Của Bậc Thuế 6', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket6Rate', value: '30', label: 'Bậc 6 - Thuế Suất (%)', description: 'Thuế Suất Bậc 6', category: 'Bậc Thuế TNCN' },
  { key: 'pitBracket7Rate', value: '35', label: 'Bậc 7 - Thuế Suất (%)', description: 'Thuế Suất Bậc 7 (Không Giới Hạn)', category: 'Bậc Thuế TNCN' },
];
export const seedDefaultConfigs = () => {
  const timestamp = new Date().toISOString();
  for (const cfg of defaultConfigs) {
    const exists = db.prepare('SELECT key FROM systemConfig WHERE key = ?').get(cfg.key);
    if (!exists) {
      db.prepare('INSERT INTO systemConfig (key, value, label, description, category, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(cfg.key, cfg.value, cfg.label, cfg.description, cfg.category, timestamp);
    }
  }
};
export const getConfig = (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM systemConfig ORDER BY category, key').all();
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi Lấy Cấu Hình:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const updateConfig = (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body as { key: string; value: string }[];
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Dữ Liệu Không Hợp Lệ' });
    }
    const timestamp = new Date().toISOString();
    const update = db.prepare('UPDATE systemConfig SET value = ?, updatedAt = ? WHERE key = ?');
    for (const item of updates) {
      update.run(item.value, timestamp, item.key);
    }
    return res.json({ success: true, message: 'Đã Lưu Cấu Hình' });
  } catch (error) {
    console.error('Lỗi Cập Nhật Cấu Hình:', error);
    return res.status(500).json({ success: false, message: 'Lỗi Hệ Thống' });
  }
};
export const getConfigValue = (key: string, fallback: number): number => {
  try {
    const row = db.prepare('SELECT value FROM systemConfig WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? parseFloat(row.value) : fallback;
  } catch {
    return fallback;
  }
};
export const getConfigString = (key: string, fallback: string): string => {
  try {
    const row = db.prepare('SELECT value FROM systemConfig WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
};
