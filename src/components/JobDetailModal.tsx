import { useState, useEffect } from 'react';
import { JobRecord, JobStatus } from '../types';
import { X, Save, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useJobStore } from '../store';

interface JobDetailModalProps {
  job: JobRecord | null;
  isPreview?: boolean;
  onClose: () => void;
}

const allStatuses: JobStatus[] = ['待投递', '已投递/初筛', '笔试/测评', '一面', '二面', '三面', 'HR面', 'Offer', '已结束'];

export default function JobDetailModal({ job, isPreview = false, onClose }: JobDetailModalProps) {
  const { addJob, updateJob } = useJobStore();
  const [formData, setFormData] = useState<Partial<JobRecord>>({});
  const [showOriginalJD, setShowOriginalJD] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  if (!job) return null;

  const handleSave = () => {
    if (isPreview) {
      addJob(formData as Omit<JobRecord, 'id' | 'updatedAt'>);
    } else {
      updateJob(job.id, formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {isPreview ? '📝 岗位详情确认' : '📋 岗位详情'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">投递岗位</label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base地</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">投递方式</label>
              <input
                type="text"
                value={formData.deliveryMethod || ''}
                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                placeholder="输入邮箱、官网链接或其他投递方式"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前进度</label>
              <select
                value={formData.status || '待投递'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {allStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">投递时间</label>
              <input
                type="date"
                value={formData.applicationDate || ''}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="添加备注信息，如面试注意事项、薪资范围、公司氛围等..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {formData.originalJD && (
            <div>
              <button
                onClick={() => setShowOriginalJD(!showOriginalJD)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <FileText size={18} />
                <span>原始职位描述</span>
                {showOriginalJD ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showOriginalJD && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {formData.originalJD}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            {isPreview ? '💾 保存至看板' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
