import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scripts, whatsapp } from '../services/api';
import {
    FileText, Plus, Play, Pause, Square, Trash2, Edit, Clock,
    MessageSquare, ChevronDown, ChevronUp, ArrowRight, Check,
    AlertCircle, Save, X, Copy, Users, Zap, Timer, Send, Variable
} from 'lucide-react';

export default function Scripts() {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingScript, setEditingScript] = useState(null);
    const [showExecuteModal, setShowExecuteModal] = useState(null);

    // Script editor state
    const [scriptName, setScriptName] = useState('');
    const [scriptDescription, setScriptDescription] = useState('');
    const [scriptMessages, setScriptMessages] = useState([
        { text: '', delayMinutes: 0, delaySeconds: 30, waitForResponse: false }
    ]);

    // Execution state
    const [selectedSession, setSelectedSession] = useState('');
    const [targetChatId, setTargetChatId] = useState('');

    // Available variables for templates
    const availableVariables = [
        { var: '{name}', desc: 'Full contact name' },
        { var: '{firstName}', desc: 'First name only' },
        { var: '{phone}', desc: 'Phone number' },
        { var: '{date}', desc: 'Current date' },
        { var: '{time}', desc: 'Current time' },
    ];

    // Fetch scripts
    const { data: scriptsData, isLoading } = useQuery({
        queryKey: ['scripts'],
        queryFn: () => scripts.getAll().then(res => res.data),
    });

    // Fetch sessions for execution
    const { data: sessionsData } = useQuery({
        queryKey: ['whatsapp-sessions'],
        queryFn: () => whatsapp.getSessions().then(res => res.data),
    });

    const connectedSessions = sessionsData?.sessions?.filter(s => s.status === 'connected') || [];

    // Fetch chats for selected session
    const { data: chatsData } = useQuery({
        queryKey: ['chats', selectedSession],
        queryFn: () => whatsapp.getChats(selectedSession).then(res => res.data),
        enabled: !!selectedSession,
    });

    // Create script mutation
    const createMutation = useMutation({
        mutationFn: ({ name, description, messages }) => scripts.create(name, description, messages),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scripts'] });
            resetForm();
            setShowCreateModal(false);
        },
    });

    // Update script mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, name, description, messages }) => scripts.update(id, name, description, messages),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scripts'] });
            resetForm();
            setEditingScript(null);
        },
    });

    // Delete script mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => scripts.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scripts'] });
        },
    });

    // Execute script mutation
    const executeMutation = useMutation({
        mutationFn: ({ scriptId, sessionId, chatId }) => scripts.execute(scriptId, sessionId, chatId),
        onSuccess: () => {
            setShowExecuteModal(null);
            setSelectedSession('');
            setTargetChatId('');
        },
    });

    const resetForm = () => {
        setScriptName('');
        setScriptDescription('');
        setScriptMessages([{ text: '', delayMinutes: 0, delaySeconds: 30, waitForResponse: false }]);
    };

    const addMessage = () => {
        setScriptMessages([
            ...scriptMessages,
            { text: '', delayMinutes: 1, delaySeconds: 0, waitForResponse: false }
        ]);
    };

    const removeMessage = (index) => {
        if (scriptMessages.length > 1) {
            setScriptMessages(scriptMessages.filter((_, i) => i !== index));
        }
    };

    const updateMessage = (index, field, value) => {
        const updated = [...scriptMessages];
        updated[index] = { ...updated[index], [field]: value };
        setScriptMessages(updated);
    };

    const insertVariable = (index, variable) => {
        const updated = [...scriptMessages];
        updated[index] = { ...updated[index], text: updated[index].text + variable };
        setScriptMessages(updated);
    };

    const handleSave = () => {
        if (!scriptName.trim()) return alert('Script name is required');
        if (!scriptMessages.some(m => m.text.trim())) return alert('At least one message is required');

        const validMessages = scriptMessages.filter(m => m.text.trim());

        if (editingScript) {
            updateMutation.mutate({
                id: editingScript.id,
                name: scriptName,
                description: scriptDescription,
                messages: validMessages
            });
        } else {
            createMutation.mutate({
                name: scriptName,
                description: scriptDescription,
                messages: validMessages
            });
        }
    };

    const handleEdit = (script) => {
        setEditingScript(script);
        setScriptName(script.name);
        setScriptDescription(script.description || '');
        setScriptMessages(script.messages);
        setShowCreateModal(true);
    };

    const handleDuplicate = (script) => {
        setScriptName(`${script.name} (copy)`);
        setScriptDescription(script.description || '');
        setScriptMessages([...script.messages]);
        setEditingScript(null);
        setShowCreateModal(true);
    };

    const handleExecute = () => {
        if (!selectedSession || !targetChatId) {
            return alert('Select a session and contact');
        }
        executeMutation.mutate({
            scriptId: showExecuteModal.id,
            sessionId: selectedSession,
            chatId: targetChatId
        });
    };

    // Get contact name for preview
    const getSelectedContactName = () => {
        const chat = chatsData?.chats?.find(c => c.id === targetChatId);
        return chat?.name || 'Contact';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Message Scripts</h1>
                            <p className="text-gray-400">Automate your message sequences</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingScript(null); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Script
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold mb-1">How it works</h3>
                        <p className="text-gray-300 text-sm">
                            Create message sequences that send automatically with realistic delays.
                            Use variables like <code className="bg-gray-800 px-1 rounded text-purple-400">{'{name}'}</code> to personalize messages for each contact.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
                                <Timer className="w-3 h-3" /> Custom delays
                            </span>
                            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Wait for reply
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                                <Variable className="w-3 h-3" /> Dynamic variables
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scripts List */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">My Scripts</h2>
                    <p className="text-sm text-gray-400">{scriptsData?.scripts?.length || 0} script(s) created</p>
                </div>

                <div className="p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : scriptsData?.scripts?.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No scripts yet</h3>
                            <p className="text-gray-400 mb-4">Create your first automated message script</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Create Script
                            </button>
                        </div>
                    ) : (
                        scriptsData?.scripts?.map((script) => (
                            <div key={script.id} className="bg-gray-700/50 rounded-lg border border-gray-600 p-5 hover:border-purple-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            {script.name}
                                        </h3>
                                        {script.description && (
                                            <p className="text-gray-400 text-sm mt-1">{script.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                {script.messages?.length || 0} message(s)
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Created {new Date(script.created_at).toLocaleDateString('en-US')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowExecuteModal(script)}
                                            className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 font-medium flex items-center gap-1"
                                        >
                                            <Play className="w-4 h-4" /> Run
                                        </button>
                                        <button
                                            onClick={() => handleEdit(script)}
                                            className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(script)}
                                            className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(script.id)}
                                            className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Preview */}
                                <div className="mt-4 space-y-2">
                                    {script.messages?.slice(0, 3).map((msg, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-purple-400 text-xs font-bold">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-300 text-sm line-clamp-1">{msg.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {(msg.delayMinutes > 0 || msg.delaySeconds > 0) && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Timer className="w-3 h-3" />
                                                            {msg.delayMinutes > 0 && `${msg.delayMinutes}m`}
                                                            {msg.delaySeconds > 0 && `${msg.delaySeconds}s`}
                                                        </span>
                                                    )}
                                                    {msg.waitForResponse && (
                                                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Wait for reply
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {idx < script.messages.length - 1 && (
                                                <ArrowRight className="w-4 h-4 text-gray-600" />
                                            )}
                                        </div>
                                    ))}
                                    {script.messages?.length > 3 && (
                                        <p className="text-gray-500 text-xs pl-9">+ {script.messages.length - 3} more messages...</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Script Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-white" />
                                <h3 className="text-xl font-bold text-white">
                                    {editingScript ? 'Edit Script' : 'New Script'}
                                </h3>
                            </div>
                            <button
                                onClick={() => { setShowCreateModal(false); setEditingScript(null); resetForm(); }}
                                className="text-white hover:bg-white/20 rounded-lg p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Variables Info */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Variable className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-blue-400 text-sm font-medium">Available Variables</p>
                                        <p className="text-gray-400 text-xs mt-1">Use these in your messages - they will be replaced with actual contact data:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {availableVariables.map((v) => (
                                                <span key={v.var} className="px-2 py-1 bg-gray-800 text-blue-300 text-xs rounded font-mono">
                                                    {v.var} <span className="text-gray-500">({v.desc})</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Script Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Script Name *</label>
                                    <input
                                        type="text"
                                        value={scriptName}
                                        onChange={(e) => setScriptName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none text-white placeholder-gray-500"
                                        placeholder="e.g. Acquisition First Contact"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={scriptDescription}
                                        onChange={(e) => setScriptDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none text-white placeholder-gray-500"
                                        placeholder="Optional description"
                                    />
                                </div>
                            </div>

                            {/* Messages */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-gray-300">Message Sequence</label>
                                    <button
                                        onClick={addMessage}
                                        className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add Message
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {scriptMessages.map((msg, idx) => (
                                        <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-sm font-bold">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={msg.text}
                                                        onChange={(e) => updateMessage(idx, 'text', e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none text-white placeholder-gray-500 resize-none"
                                                        placeholder={`Message ${idx + 1}... Use {name} for contact name`}
                                                        rows={3}
                                                    />
                                                    {/* Quick variable insert */}
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {availableVariables.map((v) => (
                                                            <button
                                                                key={v.var}
                                                                type="button"
                                                                onClick={() => insertVariable(idx, v.var)}
                                                                className="px-2 py-0.5 bg-gray-800 text-blue-400 text-xs rounded hover:bg-gray-700 font-mono"
                                                            >
                                                                + {v.var}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {scriptMessages.length > 1 && (
                                                    <button
                                                        onClick={() => removeMessage(idx)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Message Options */}
                                            <div className="flex flex-wrap items-center gap-4 pl-11">
                                                <div className="flex items-center gap-2">
                                                    <Timer className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-400 text-sm">Delay before sending:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="60"
                                                        value={msg.delayMinutes}
                                                        onChange={(e) => updateMessage(idx, 'delayMinutes', parseInt(e.target.value) || 0)}
                                                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center text-sm"
                                                    />
                                                    <span className="text-gray-500 text-sm">min</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="59"
                                                        value={msg.delaySeconds}
                                                        onChange={(e) => updateMessage(idx, 'delaySeconds', parseInt(e.target.value) || 0)}
                                                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center text-sm"
                                                    />
                                                    <span className="text-gray-500 text-sm">sec</span>
                                                </div>

                                                {idx > 0 && (
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={msg.waitForResponse}
                                                            onChange={(e) => updateMessage(idx, 'waitForResponse', e.target.checked)}
                                                            className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                                                        />
                                                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Wait for reply before sending
                                                        </span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => { setShowCreateModal(false); setEditingScript(null); resetForm(); }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingScript ? 'Update Script' : 'Create Script'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Execute Script Modal */}
            {showExecuteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Play className="w-6 h-6 text-white" />
                                <h3 className="text-xl font-bold text-white">Run Script</h3>
                            </div>
                            <button
                                onClick={() => setShowExecuteModal(null)}
                                className="text-white hover:bg-white/20 rounded-lg p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                <h4 className="text-white font-medium mb-1">{showExecuteModal.name}</h4>
                                <p className="text-gray-400 text-sm">{showExecuteModal.messages?.length} messages to send</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Session</label>
                                <select
                                    value={selectedSession}
                                    onChange={(e) => { setSelectedSession(e.target.value); setTargetChatId(''); }}
                                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 outline-none text-white"
                                >
                                    <option value="">Select a session...</option>
                                    {connectedSessions.map((session) => (
                                        <option key={session.sessionId} value={session.sessionId}>
                                            {session.name || session.phoneNumber || session.sessionId}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Contact / Chat</label>
                                <select
                                    value={targetChatId}
                                    onChange={(e) => setTargetChatId(e.target.value)}
                                    disabled={!selectedSession}
                                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 outline-none text-white disabled:opacity-50"
                                >
                                    <option value="">Select a contact...</option>
                                    {chatsData?.chats?.map((chat) => (
                                        <option key={chat.id} value={chat.id}>
                                            {chat.name || chat.id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview with variables replaced */}
                            {targetChatId && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                    <p className="text-purple-400 text-sm font-medium mb-2">Preview (first message):</p>
                                    <p className="text-gray-300 text-sm">
                                        {showExecuteModal.messages?.[0]?.text
                                            .replace('{name}', getSelectedContactName())
                                            .replace('{firstName}', getSelectedContactName().split(' ')[0])
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-yellow-400 text-sm font-medium">Warning</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Once started, the script will send messages automatically with configured delays.
                                            Make sure you selected the correct contact.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExecuteModal(null)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExecute}
                                    disabled={!selectedSession || !targetChatId || executeMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {executeMutation.isPending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Run Script
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
