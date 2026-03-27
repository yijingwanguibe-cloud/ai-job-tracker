import { useState } from 'react';
import { Trash2, Plus, Eye } from 'lucide-react';
import { useNoteStore } from '../noteStore';
import AddNoteModal from '../components/AddNoteModal';
import NoteDetailModal from '../components/NoteDetailModal';
import { NoteRecord, NoteCategory } from '../types';

const categoryColors: Record<NoteCategory, string> = {
  '过往经历': 'bg-blue-100 text-blue-800',
  '常见面经': 'bg-green-100 text-green-800',
  '复盘反思': 'bg-purple-100 text-purple-800'
};

export default function KnowledgePage() {
  const { notes, addNote, deleteNote } = useNoteStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🗂️ 个人知识库</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>新建笔记</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无笔记</h3>
            <p className="text-gray-500 mb-4">点击上方按钮创建你的第一条笔记</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>创建第一条笔记</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">标题</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">分类</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">内容预览</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">创建时间</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notes.map((note: NoteRecord) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{note.title}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[note.category]}`}>
                        {note.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {truncateContent(note.content)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(note.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedNote(note);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addNote}
      />

      <NoteDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
      />
    </div>
  );
}
