import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import JDInputArea from '../components/JDInputArea';
import JobTable from '../components/JobTable';
import JobDetailModal from '../components/JobDetailModal';
import ApiKeyModal from '../components/ApiKeyModal';
import { JobRecord } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [previewJob, setPreviewJob] = useState<Omit<JobRecord, 'id' | 'updatedAt'> | null>(null);
  const [detailJob, setDetailJob] = useState<JobRecord | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const handleStartInterview = (job: JobRecord) => {
    navigate('/interview', { state: { job } });
  };

  return (
    <div>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={20} />
            <span>API Key 设置</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <JDInputArea onParseComplete={setPreviewJob} />
        <JobTable onViewDetail={setDetailJob} onStartInterview={handleStartInterview} />
      </main>

      {previewJob && (
        <JobDetailModal
          job={{ ...previewJob, id: 'preview', updatedAt: new Date().toISOString() } as JobRecord}
          isPreview={true}
          onClose={() => setPreviewJob(null)}
        />
      )}

      {detailJob && (
        <JobDetailModal
          job={detailJob}
          isPreview={false}
          onClose={() => setDetailJob(null)}
        />
      )}

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}
