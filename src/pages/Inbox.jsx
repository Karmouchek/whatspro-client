import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Search, Filter, Clock, CheckCheck, X } from 'lucide-react';
import { conversations as conversationsApi, messages as messagesApi, countries as countriesApi } from '../services/api';
import { getCountryFlag } from '../utils/countries';
import { formatRelativeTime, getWindowStatus } from '../utils/time';
import { useTranslation } from '../hooks/useTranslation';

export default function Inbox() {
  const t = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations', filterCountry, filterStatus],
    queryFn: () => conversationsApi.getAll({ country: filterCountry, status: filterStatus }).then(res => res.data),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch all countries for the dropdown
  const { data: allCountries } = useQuery({
    queryKey: ['all-countries'],
    queryFn: () => countriesApi.getAll().then(res => res.data),
  });

  // Handle response format with pagination
  const conversations = conversationsData?.data || conversationsData || [];

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation ? messagesApi.getByConversation(selectedConversation.id).then(res => res.data) : [],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content }) => messagesApi.send(conversationId, content),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries(['messages', selectedConversation?.id]);
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    const windowStatus = getWindowStatus(selectedConversation.window_expires_at);
    if (!windowStatus.active) {
      alert('24h window expired! Please use an approved template.');
      return;
    }

    sendMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageText,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Conversations List */}
      <div className="w-96 border-r border-gray-700 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{t('nav.inbox')}</h2>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 text-white"
            >
              <option value="">All Countries</option>
              {allCountries?.map((country) => (
                <option key={country.iso_code} value={country.iso_code}>
                  {country.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 text-white"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations?.map((conv) => {
            const windowStatus = getWindowStatus(conv.window_expires_at);
            const isSelected = selectedConversation?.id === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                  isSelected ? 'bg-violet-500/20 border-l-4 border-l-violet-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(conv.country)}</span>
                    <div>
                      <p className="font-semibold text-white">{conv.phone}</p>
                      <p className="text-xs text-gray-400">{conv.country_name}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    windowStatus.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    windowStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    windowStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {windowStatus.active ? `${Math.floor(windowStatus.hoursLeft)}h` : 'Expired'}
                  </div>
                </div>

                <p className="text-sm text-gray-400 truncate mb-2">{conv.last_message || 'No messages yet'}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatRelativeTime(conv.last_message_at)}</span>
                  {conv.agent_name && (
                    <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">{conv.agent_name}</span>
                  )}
                </div>
              </div>
            );
          })}

          {conversations?.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCountryFlag(selectedConversation.country)}</span>
                <div>
                  <p className="font-semibold text-white">{selectedConversation.phone}</p>
                  <p className="text-sm text-gray-400">{selectedConversation.country_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getWindowStatus(selectedConversation.window_expires_at).active ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Window: {Math.floor(getWindowStatus(selectedConversation.window_expires_at).hoursLeft)}h left</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <X className="w-4 h-4" />
                    <span>Window expired - Template required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.direction === 'out'
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-700 border border-gray-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      msg.direction === 'out' ? 'text-violet-200' : 'text-gray-400'
                    }`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.direction === 'out' && msg.status === 'read' && (
                        <CheckCheck className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="bg-gray-800 p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!getWindowStatus(selectedConversation.window_expires_at).active}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-400 disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMutation.isPending || !getWindowStatus(selectedConversation.window_expires_at).active}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
              {!getWindowStatus(selectedConversation.window_expires_at).active && (
                <p className="text-sm text-red-400 mt-2">
                  ⚠️ 24h window expired. You must use an approved template to continue this conversation.
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">Select a conversation to start messaging</p>
              <p className="text-sm">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
