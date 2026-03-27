import { X, Copy } from 'lucide-react';
import { NoteRecord, NoteCategory } from '../types';

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: NoteRecord | null;
}

const categoryColors: Record<NoteCategory, string> = {
  '过往经历': 'bg-blue-100 text-blue-800',
  '常见面经': 'bg-green-100 text-green-800',
  '复盘反思': 'bg-purple-100 text-purple-800'
};

export default function NoteDetailModal({ isOpen, onClose, note }: NoteDetailModalProps) {
  if (!isOpen || !note) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      alert('已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{note.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[note.category]}`}>
                {note.category}
              </span>
              <span className="text-sm text-gray-500">
                创建于 {formatDate(note.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed">
              {note.content}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy size={18} />
            <span>复制内容</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
