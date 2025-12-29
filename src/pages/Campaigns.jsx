import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Send, FileSpreadsheet, Play, CheckCircle, XCircle, Loader, Calendar, Clock, Phone, User } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { campaigns as campaignsApi } from '../services/api';
import { formatDateTime } from '../utils/time';

export default function Campaigns() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [senderType, setSenderType] = useState('phone');
  const [senderValue, setSenderValue] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.getAll().then(res => res.data),
    refetchInterval: 5000,
  });

  const importMutation = useMutation({
    mutationFn: (formData) => campaignsApi.import(formData),
    onSuccess: () => {
      setSelectedFile(null);
      setCampaignName('');
      setSenderType('phone');
      setSenderValue('');
      setScheduleEnabled(false);
      setScheduleDate('');
      setScheduleTime('');
      queryClient.invalidateQueries(['campaigns']);
    },
  });

  const launchMutation = useMutation({
    mutationFn: (id) => campaignsApi.launch(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
    },
  });

  const handleImport = () => {
    if (!selectedFile || !campaignName) {
      alert('Please select a file and enter a campaign name');
      return;
    }

    if (scheduleEnabled && (!scheduleDate || !scheduleTime)) {
      alert('Please select a date and time for scheduling');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', campaignName);
    
    if (senderValue.trim()) {
      formData.append('senderType', senderType);
      formData.append('senderValue', senderValue.trim());
    }
    
    if (scheduleEnabled && scheduleDate && scheduleTime) {
      formData.append('scheduledAt', `${scheduleDate}T${scheduleTime}:00`);
    }

    importMutation.mutate(formData);
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-600 text-gray-300',
      running: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          📢 Campaigns
        </h1>
        <p className="text-gray-400 mt-1">Import and launch WhatsApp campaigns</p>
      </div>

      {/* Import Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 hover:border-violet-500/30 transition-all">
        <h2 className="text-xl font-semibold text-white mb-4">Import Campaign</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Black Friday Promo"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-500"
          />
        </div>

        {/* Sender Identity */}
        <div className={`mb-4 border rounded-lg p-4 ${senderType === 'phone' ? 'bg-green-500/10 border-green-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">
              <Send className="w-4 h-4 inline mr-1" />
              Sender Identity (Optional)
            </label>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSenderType('phone')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  senderType === 'phone' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-600'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </button>
              <button
                type="button"
                onClick={() => setSenderType('name')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  senderType === 'name' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-600'
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Name
              </button>
            </div>
          </div>
          
          <input
            type={senderType === 'phone' ? 'tel' : 'text'}
            value={senderValue}
            onChange={(e) => setSenderValue(e.target.value)}
            placeholder={senderType === 'phone' ? '+33612345678' : 'Your Business Name'}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-500 ${
              senderType === 'phone' 
                ? 'border-green-500/30 focus:ring-green-500' 
                : 'border-purple-500/30 focus:ring-purple-500'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {senderType === 'phone' 
              ? '📱 Override sender from CSV with this WhatsApp number' 
              : '👤 Use a display name instead of phone number'}
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-gray-600 hover:border-violet-500/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          
          {selectedFile ? (
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV/Excel file'}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400 font-medium mb-2">📋 Expected CSV Format:</p>
          <code className="text-xs bg-gray-700 px-2 py-1 rounded block overflow-x-auto text-gray-300">
            phone,country,sender,template,var1,var2,order
          </code>
          <p className="text-xs text-blue-400/70 mt-2">
            • <strong>phone:</strong> +33612345678 (international format)<br />
            • <strong>country:</strong> FR, ES, MA, etc.<br />
            • <strong>sender:</strong> WhatsApp number ID (optional - auto-routed by country)<br />
            • <strong>template:</strong> Approved template name<br />
            • <strong>var1, var2:</strong> Template variables<br />
            • <strong>order:</strong> Send priority (optional)
          </p>
        </div>

        {/* Schedule Option */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-white">Schedule Campaign</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {scheduleEnabled && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-orange-400 mt-2">
                📅 Campaign will start automatically at the scheduled time
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={!selectedFile || !campaignName || importMutation.isPending || (scheduleEnabled && (!scheduleDate || !scheduleTime))}
          className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            scheduleEnabled 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
          }`}
        >
          {importMutation.isPending ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              {scheduleEnabled ? 'Scheduling...' : 'Importing...'}
            </>
          ) : scheduleEnabled ? (
            <>
              <Calendar className="w-5 h-5" />
              Schedule Campaign
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-5 h-5" />
              Import Campaign
            </>
          )}
        </button>
      </div>

      {/* Campaigns List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Campaign History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Failed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {campaigns?.map((campaign) => {
                const successRate = campaign.total_messages > 0
                  ? ((campaign.sent_messages / campaign.total_messages) * 100).toFixed(1)
                  : 0;

                return (
                  <tr key={campaign.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {campaign.total_messages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        {campaign.sent_messages}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-4 h-4" />
                        {campaign.failed_messages}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{successRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDateTime(campaign.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => launchMutation.mutate(campaign.id)}
                          disabled={launchMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          Launch
                        </button>
                      )}
                      {campaign.status === 'running' && (
                        <div className="flex items-center gap-1 text-blue-400 text-sm">
                          <Loader className="w-4 h-4 animate-spin" />
                          Running...
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {campaigns?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No campaigns yet. Import your first CSV file to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
