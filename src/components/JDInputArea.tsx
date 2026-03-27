import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { mockAIParse } from '../mockAI';
import { JobRecord } from '../types';

interface JDInputAreaProps {
  onParseComplete: (data: Omit<JobRecord, 'id' | 'updatedAt'>) => void;
}

export default function JDInputArea({ onParseComplete }: JDInputAreaProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await mockAIParse(text);
      onParseComplete({ ...result, originalJD: text });
    } catch (error) {
      console.error('解析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">✨ 新建投递</h2>
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="请粘贴职位描述 (JD) 文本..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={handleParse}
        disabled={loading || !text.trim()}
        className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles size={20} />
        {loading ? '解析中...' : 'AI智能解析'}
      </button>
    </div>
  );
}
