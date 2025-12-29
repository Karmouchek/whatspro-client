import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { whatsapp, ai, scheduled, scripts } from '../services/api';
import { socketService } from '../services/socket';
import { MessageCircle, Send, Image, Paperclip, Search, Phone, Video, MoreVertical, ArrowLeft, Users, User, Smile, Mic, X, Info, Trash2, VolumeX, Clock, Ban, AlertTriangle, Star, CheckSquare, Settings, LogOut, Bell, Lock, Key, HelpCircle, Smartphone, Plus, ChevronDown, ChevronUp, File, Camera, MessageSquare, Copy, Forward, Pin, Bot, Calendar, Sparkles, Loader2 } from 'lucide-react';

export default function Chats() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionFromUrl = searchParams.get('session');

  const [selectedSession, setSelectedSession] = useState(sessionFromUrl);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'clear', 'delete', 'block', 'report'
  const [isMuted, setIsMuted] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCallModal, setShowCallModal] = useState(null); // 'voice' or 'video'
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionsList, setShowSessionsList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [disappearingMessages, setDisappearingMessages] = useState('off');
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messageSelectMode, setMessageSelectMode] = useState(false);
  const [searchInChat, setSearchInChat] = useState('');
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    sounds: true,
    desktop: true,
    preview: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    readReceipts: true
  });
  // AI Assistant states
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [showAiModelMenu, setShowAiModelMenu] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState(() => {
    return localStorage.getItem('meIA_selectedModel') || 'claude-3.5-sonnet';
  });
  // Scripts states
  const [showScriptsList, setShowScriptsList] = useState(false);
  const [availableScripts, setAvailableScripts] = useState([]);

  // Available AI Models with detailed capabilities
  const aiModels = [
    {
      id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠', color: 'from-orange-500 to-amber-600', desc: 'Best balance', recommended: true,
      capabilities: ['📝 Text', '🖼️ Vision', '💻 Code', '📊 Analysis']
    },
    {
      id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '🎭', color: 'from-purple-500 to-violet-600', desc: 'Ultra smart',
      capabilities: ['📝 Text', '🖼️ Vision', '💻 Code', '🎨 Creative']
    },
    {
      id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', icon: '🤖', color: 'from-green-500 to-emerald-600', desc: 'Vision + 128K',
      capabilities: ['📝 Text', '🖼️ Vision', '💻 Code', '🔧 Functions']
    },
    {
      id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '⚡', color: 'from-teal-500 to-cyan-600', desc: 'Native multimodal',
      capabilities: ['📝 Text', '🖼️ Vision', '🎤 Audio', '🎬 Video']
    },
    {
      id: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'Google', icon: '💎', color: 'from-blue-500 to-indigo-600', desc: '1M token context',
      capabilities: ['📝 Text', '🖼️ Vision', '🎬 Video', '🎵 Audio']
    },
    {
      id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google', icon: '⚡', color: 'from-sky-500 to-blue-600', desc: 'Fast & cheap',
      capabilities: ['📝 Text', '🖼️ Vision', '🎬 Video', '💨 Fast']
    },
    {
      id: 'sora', name: 'Sora', provider: 'OpenAI', icon: '🎥', color: 'from-pink-500 to-rose-600', desc: 'Video generation',
      capabilities: ['🎬 Video', '🎨 Generation', '✨ HD', '⏱️ 60s']
    },
    {
      id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', icon: '🎨', color: 'from-yellow-500 to-orange-600', desc: 'Image generation',
      capabilities: ['🖼️ Images', '🎨 Art', '📐 HD', '✏️ Editing']
    },
    {
      id: 'midjourney', name: 'Midjourney', provider: 'Midjourney', icon: '🌌', color: 'from-violet-500 to-purple-600', desc: 'Premium gen art',
      capabilities: ['🖼️ Images', '🎨 Art', '✨ Artistic', '🖌️ Styles']
    },
    {
      id: 'stable-diffusion', name: 'Stable Diffusion', provider: 'Stability AI', icon: '🌀', color: 'from-emerald-500 to-teal-600', desc: 'Open source images',
      capabilities: ['🖼️ Images', '🎨 Art', '🔓 Open', '⚡ Fast']
    },
    {
      id: 'eleven-labs', name: 'ElevenLabs', provider: 'ElevenLabs', icon: '🎙️', color: 'from-amber-500 to-yellow-600', desc: 'AI voice synthesis',
      capabilities: ['🎤 Voice', '🎵 TTS', '🗣️ Cloning', '🌍 Multilang']
    },
    {
      id: 'whisper', name: 'Whisper', provider: 'OpenAI', icon: '👂', color: 'from-cyan-500 to-blue-600', desc: 'Audio transcription',
      capabilities: ['🎤 Audio', '📝 Transcription', '🌍 100+ langs', '⏱️ Realtime']
    },
    {
      id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', icon: '🌪️', color: 'from-red-500 to-rose-600', desc: 'European AI',
      capabilities: ['📝 Text', '💻 Code', '🇪🇺 GDPR', '🌍 Multilang']
    },
    {
      id: 'llama-3-70b', name: 'LLaMA 3 70B', provider: 'Meta', icon: '🦙', color: 'from-indigo-500 to-purple-600', desc: 'Open Source',
      capabilities: ['📝 Text', '💻 Code', '🔓 Open', '🆓 Free']
    },
    {
      id: 'deepseek-v2', name: 'DeepSeek V2', provider: 'DeepSeek', icon: '🔬', color: 'from-cyan-500 to-teal-600', desc: 'Code expert',
      capabilities: ['💻 Code', '🧮 Math', '📝 Text', '💰 Cheap']
    },
    {
      id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway', icon: '🎬', color: 'from-rose-500 to-pink-600', desc: 'Advanced AI video',
      capabilities: ['🎬 Video', '✨ Effects', '🎨 Motion', '🖼️ Img→Video']
    },
    {
      id: 'music-gen', name: 'MusicGen', provider: 'Meta', icon: '🎵', color: 'from-fuchsia-500 to-pink-600', desc: 'Music generation',
      capabilities: ['🎵 Music', '🎼 Composition', '🎸 Instruments', '🔓 Open']
    },
  ];
  // Scheduled messages states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  // Number check states
  const [numberCheckResult, setNumberCheckResult] = useState(null);
  const [checkingNumber, setCheckingNumber] = useState(false);
  // Local messages state for optimistic updates
  const [localMessages, setLocalMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Get all sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: () => whatsapp.getSessions().then(res => res.data),
    refetchInterval: 10000, // Reduced from 5s to 10s
  });

  const connectedSessions = useMemo(() =>
    sessionsData?.sessions?.filter(s => s.status === 'connected') || [],
    [sessionsData?.sessions]
  );

  // Connect to socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
    // Don't disconnect on unmount - keep socket alive for real-time updates
    // Socket will be disconnected on logout
  }, []);

  // Join session room and listen for updates
  useEffect(() => {
    if (selectedSession) {
      socketService.joinSession(selectedSession);
      console.log('🔌 Joined session room:', selectedSession);

      const handleNewMessage = (data) => {
        console.log('📩 New message received:', data);

        // Add received message to local state for instant display
        if (data.chatId && data.message) {
          if (data.chatId === selectedChat) {
            setLocalMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(m => m.id?._serialized === data.message.id?._serialized);
              if (exists) return prev;
              return [...prev, data.message];
            });
          }
        }

        // Refetch chats list
        queryClient.invalidateQueries({ queryKey: ['chats', selectedSession] });
      };

      const handleChatUpdate = (data) => {
        console.log('📝 Chat update received:', data);
        queryClient.refetchQueries({ queryKey: ['chats', selectedSession] });
      };

      socketService.on('new_message', handleNewMessage);
      socketService.on('chat_update', handleChatUpdate);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('chat_update', handleChatUpdate);
      };
    }
  }, [selectedSession, selectedChat, queryClient]);

  // Auto-select session from URL or first connected session
  useEffect(() => {
    if (sessionFromUrl) {
      setSelectedSession(sessionFromUrl);
    } else if (!selectedSession && connectedSessions.length > 0) {
      setSelectedSession(connectedSessions[0].sessionId);
    }
  }, [sessionFromUrl, connectedSessions, selectedSession]);

  // Verify session exists in connected sessions
  useEffect(() => {
    if (selectedSession && connectedSessions.length > 0) {
      const sessionExists = connectedSessions.some(s => s.sessionId === selectedSession);
      if (!sessionExists) {
        console.warn(`Session ${selectedSession} not found, switching to first available`);
        setSelectedSession(connectedSessions[0].sessionId);
      }
    }
  }, [selectedSession, connectedSessions]);

  // Get my profile info
  const { data: myProfile } = useQuery({
    queryKey: ['me', selectedSession],
    queryFn: () => whatsapp.getMe(selectedSession).then(res => res.data),
    enabled: !!selectedSession,
    refetchOnWindowFocus: false,
  });

  // Get chats for selected session
  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats', selectedSession],
    queryFn: () => whatsapp.getChats(selectedSession).then(res => res.data),
    enabled: !!selectedSession && connectedSessions.some(s => s.sessionId === selectedSession),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedSession, selectedChat],
    queryFn: () => whatsapp.getChatMessages(selectedSession, selectedChat).then(res => res.data),
    enabled: !!selectedSession && !!selectedChat,
    refetchInterval: 8000,
    refetchOnWindowFocus: false,
  });

  // Clear local messages when chat changes or when server has our messages
  useEffect(() => {
    if (selectedChat) {
      setLocalMessages([]);
    }
  }, [selectedChat]);

  // Combine server messages with local optimistic messages
  const allMessages = [
    ...(messagesData?.messages || []),
    ...localMessages.filter(local => {
      // Remove local message if server now has it (check by body + fromMe + close timestamp)
      const serverHasIt = messagesData?.messages?.some(srv =>
        srv.body === local.body &&
        srv.fromMe === local.fromMe &&
        Math.abs(srv.timestamp - local.timestamp) < 120
      );
      return !serverHasIt;
    })
  ];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, chatId, message }) =>
      whatsapp.sendChatMessage(sessionId, chatId, message),
    onMutate: async ({ message }) => {
      // Add to local messages immediately with single check
      const newMsg = {
        id: { _serialized: `local_${Date.now()}` },
        body: message,
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        ack: 1, // Single check ✓
        type: 'chat'
      };
      setLocalMessages(prev => [...prev, newMsg]);
      setMessageText('');
    },
    onSuccess: (response, { sessionId, chatId }) => {
      // Clear local messages and refetch to get real message from server
      setLocalMessages([]);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['messages', sessionId, chatId] });
        queryClient.invalidateQueries({ queryKey: ['chats', sessionId] });
      }, 500);
    },
    onError: (err) => {
      console.error('Failed to send message:', err);
      // Remove the last local message on error
      setLocalMessages(prev => prev.slice(0, -1));
    },
  });

  // Chat menu action handlers
  const handleCloseChat = () => {
    setSelectedChat(null);
    setShowChatMenu(false);
  };

  const handleMuteNotifications = () => {
    setIsMuted(!isMuted);
    setShowChatMenu(false);
    // In a real app, this would call an API to mute the chat
  };

  const handleClearChat = () => {
    setShowConfirmModal('clear');
    setShowChatMenu(false);
  };

  const handleDeleteChat = () => {
    setShowConfirmModal('delete');
    setShowChatMenu(false);
  };

  const handleBlockContact = () => {
    setShowConfirmModal('block');
    setShowChatMenu(false);
  };

  const handleReportContact = () => {
    setShowConfirmModal('report');
    setShowChatMenu(false);
  };

  const handleContactInfo = () => {
    setShowContactInfo(true);
    setShowChatMenu(false);
  };

  const confirmAction = async () => {
    const chat = filteredChats.find(c => c.id === selectedChat);

    switch (showConfirmModal) {
      case 'clear':
        // Clear messages from local view
        queryClient.setQueryData(['messages', selectedSession, selectedChat], { messages: [] });
        break;
      case 'delete':
        // Remove chat from list and close
        setSelectedChat(null);
        queryClient.invalidateQueries(['chats', selectedSession]);
        break;
      case 'block':
        // In a real app, this would call WhatsApp API to block
        alert(`${chat?.name || 'Contact'} has been blocked`);
        setSelectedChat(null);
        break;
      case 'report':
        // In a real app, this would send a report
        alert(`${chat?.name || 'Contact'} has been reported`);
        break;
    }
    setShowConfirmModal(null);
  };

  // Left menu action handlers
  const handleNewGroup = () => {
    setShowNewGroupModal(true);
    setShowMenu(false);
  };

  const handleNewCommunity = () => {
    alert('Communities feature coming soon!');
    setShowMenu(false);
  };

  const handleStarredMessages = () => {
    setShowStarredMessages(true);
    setShowMenu(false);
  };

  const handleSelectChats = () => {
    setSelectMode(!selectMode);
    setSelectedChats([]);
    setShowMenu(false);
  };

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
    window.location.href = '/login';
  };

  const toggleChatSelection = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleDeleteSelectedChats = () => {
    if (selectedChats.length > 0) {
      // Remove selected chats from view
      setSelectedChats([]);
      setSelectMode(false);
      queryClient.invalidateQueries(['chats', selectedSession]);
      alert(`${selectedChats.length} chat(s) deleted`);
    }
  };

  // Call handlers
  const handleVoiceCall = () => {
    const chat = filteredChats.find(c => c.id === selectedChat);
    if (chat?.isGroup) {
      alert('Group calls are not supported in web version');
      return;
    }
    setShowCallModal('voice');
  };

  const handleVideoCall = () => {
    const chat = filteredChats.find(c => c.id === selectedChat);
    if (chat?.isGroup) {
      alert('Group video calls are not supported in web version');
      return;
    }
    setShowCallModal('video');
  };

  const handleSearchInChat = () => {
    setShowSearchInChat(!showSearchInChat);
    setSearchInChat('');
  };

  // Emoji picker
  const emojis = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '👋', '🙏', '💪', '🤝', '💯'];

  const insertEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // File attachment handler
  const handleFileSelect = (type) => {
    setShowAttachMenu(false);
    if (type === 'document') {
      fileInputRef.current?.click();
    } else {
      alert(`${type} upload - Feature coming soon!`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" selected. File sending feature coming soon!`);
    }
  };

  // Message selection handlers
  // eslint-disable-next-line no-unused-vars
  const toggleMessageSelection = (msgId) => {
    if (selectedMessages.includes(msgId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== msgId));
    } else {
      setSelectedMessages([...selectedMessages, msgId]);
    }
  };

  const handleCopyMessages = () => {
    const msgs = messagesData?.messages?.filter(m => selectedMessages.includes(m.id._serialized || m.id));
    const text = msgs?.map(m => m.body).join('\n') || '';
    navigator.clipboard.writeText(text);
    alert('Messages copied to clipboard');
    setMessageSelectMode(false);
    setSelectedMessages([]);
  };

  const handleForwardMessages = () => {
    alert(`Forward ${selectedMessages.length} message(s) - Feature coming soon!`);
    setMessageSelectMode(false);
    setSelectedMessages([]);
  };

  const handleDeleteMessages = () => {
    alert(`Delete ${selectedMessages.length} message(s) - Feature coming soon!`);
    setMessageSelectMode(false);
    setSelectedMessages([]);
  };

  const handleStarMessages = () => {
    alert(`Star ${selectedMessages.length} message(s) - Feature coming soon!`);
    setMessageSelectMode(false);
    setSelectedMessages([]);
  };

  // Disappearing messages handler
  const handleDisappearingMessages = () => {
    setShowDisappearingModal(true);
    setShowChatMenu(false);
  };

  const setDisappearingOption = (option) => {
    setDisappearingMessages(option);
    setShowDisappearingModal(false);
    const chat = filteredChats.find(c => c.id === selectedChat);
    alert(`Disappearing messages ${option === 'off' ? 'turned off' : `set to ${option}`} for ${chat?.name}`);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Load available scripts
  const loadScripts = async () => {
    try {
      const res = await scripts.getAll();
      setAvailableScripts(res.data.scripts || []);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    }
  };

  // Run a script on the current chat
  const [runningScript, setRunningScript] = useState(false);

  const runScriptOnChat = async (script) => {
    if (!selectedSession || !selectedChat) {
      alert('Please select a chat first');
      return;
    }

    if (runningScript) {
      return; // Prevent double-click
    }

    setRunningScript(true);
    try {
      await scripts.execute(script.id, selectedSession, selectedChat);
      alert(`Script "${script.name}" started! Messages will be sent automatically.`);
      setShowScriptsList(false);
      setShowAiPanel(false);
    } catch (err) {
      console.error('Failed to run script:', err);
      alert('Failed to start script: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunningScript(false);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setShowMenu(false);
        setShowChatMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedSession || !selectedChat) return;

    sendMessageMutation.mutate({
      sessionId: selectedSession,
      chatId: selectedChat,
      message: messageText,
    });
  };

  // AI Generate Response - peut utiliser le dernier message ou un input personnalisé
  const handleGenerateAI = async (customInput = null) => {
    if (!selectedSession || !selectedChat) return;

    const _chat = filteredChats.find(c => c.id === selectedChat);

    // Utiliser l'input personnalisé ou le dernier message reçu
    let messageToProcess = customInput;
    if (!messageToProcess) {
      const lastMessage = messagesData?.messages?.filter(m => !m.fromMe).slice(-1)[0];
      messageToProcess = lastMessage?.body;
    }

    if (!messageToProcess) {
      setAiSuggestion('Écrivez une instruction ci-dessous pour me donner vos ordres.');
      setShowAiPanel(true);
      return;
    }

    setAiGenerating(true);
    setShowAiPanel(true);

    try {
      const response = await ai.testResponse(messageToProcess, {
        enabled: true,
        persona: 'executive',
        name: 'Directeur',
        language: 'fr',
        tone: 'professional'
      });
      setAiSuggestion(response.data.response);
    } catch (err) {
      console.error('AI generation failed:', err);
      setAiSuggestion('Erreur de génération. Réessayez.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Envoyer une instruction à l'IA
  const handleAiCommand = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    await handleGenerateAI(aiInput);
    setAiInput('');
  };

  // Use AI suggestion
  const useAiSuggestion = () => {
    setMessageText(aiSuggestion);
    setShowAiPanel(false);
    setAiSuggestion('');
  };

  // Schedule message
  const handleScheduleMessage = async () => {
    if (!messageText.trim() || !selectedSession || !selectedChat || !scheduleDate || !scheduleTime) {
      alert('Please fill in all fields');
      return;
    }

    const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;

    try {
      await scheduled.schedule(selectedSession, selectedChat, messageText, scheduledAt);
      alert('Message scheduled successfully!');
      setMessageText('');
      setShowScheduleModal(false);
      setScheduleDate('');
      setScheduleTime('');
    } catch (err) {
      console.error('Failed to schedule:', err);
      alert('Failed to schedule message');
    }
  };

  // Check if search query is a phone number (at least 8 digits)
  const isPhoneNumber = (query) => {
    const digits = query.replace(/[^0-9]/g, '');
    return digits.length >= 8;
  };

  // Check WhatsApp number when searching
  useEffect(() => {
    const checkNumber = async () => {
      if (!selectedSession || !searchQuery || !isPhoneNumber(searchQuery)) {
        setNumberCheckResult(null);
        return;
      }

      // Don't check if we already have this number in chats
      const digits = searchQuery.replace(/[^0-9]/g, '');
      const existsInChats = chatsData?.chats?.some(chat => {
        const chatNumber = chat.id?.split('@')[0] || '';
        return chatNumber.includes(digits);
      });

      if (existsInChats) {
        setNumberCheckResult(null);
        return;
      }

      setCheckingNumber(true);
      try {
        const response = await whatsapp.checkNumber(selectedSession, digits);
        setNumberCheckResult(response.data);
      } catch (err) {
        console.error('Failed to check number:', err);
        setNumberCheckResult({ exists: false, error: true });
      } finally {
        setCheckingNumber(false);
      }
    };

    const debounce = setTimeout(checkNumber, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedSession, chatsData?.chats]);

  // Open chat with checked number
  const openChatWithNumber = () => {
    if (numberCheckResult?.exists && numberCheckResult?.chatId) {
      setSelectedChat(numberCheckResult.chatId);
      setSearchQuery('');
      setNumberCheckResult(null);
    }
  };

  const filteredChats = chatsData?.chats?.filter(chat => {
    const query = searchQuery.toLowerCase();
    const nameMatch = chat.name?.toLowerCase().includes(query);
    // Extraire le numéro du chat ID (format: 33612345678@c.us)
    const phoneNumber = chat.id?.split('@')[0] || '';
    const phoneMatch = phoneNumber.includes(query.replace(/[^0-9]/g, ''));
    return nameMatch || phoneMatch;
  }) || [];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show "Syncing" instead of "No conversations" initially
  const [showSyncing, setShowSyncing] = useState(true);

  useEffect(() => {
    if (!chatsLoading && filteredChats.length === 0) {
      const timer = setTimeout(() => setShowSyncing(false), 10000); // Show syncing for 10s max
      return () => clearTimeout(timer);
    } else if (filteredChats.length > 0) {
      setShowSyncing(false);
    }
  }, [chatsLoading, filteredChats.length]);

  if (connectedSessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No WhatsApp Connected</h2>
          <p className="text-gray-400 mb-4">Connect a WhatsApp account to start chatting</p>
          <a href="/whatsapp" className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/20 transition-all inline-block">
            Connect WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // Function to switch session without interrupting others
  const switchSession = (sessionId) => {
    setSelectedSession(sessionId);
    setSelectedChat(null); // Reset selected chat when switching
    setShowContactInfo(false);
  };

  return (
    <div className="flex h-screen bg-[#111b21] font-sans">
      {/* Sessions Sidebar - Left */}
      <div className="w-16 bg-[#202c33] border-r border-[#2a3942] flex flex-col">
        {/* Sessions Header */}
        <div className="h-[59px] flex items-center justify-center border-b border-[#2a3942]">
          <button
            onClick={() => setShowSessionsList(!showSessionsList)}
            className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
            title={showSessionsList ? 'Hide sessions' : 'Show sessions'}
          >
            {showSessionsList ? (
              <ChevronUp className="w-5 h-5 text-[#00a884]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#00a884]" />
            )}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto py-2">
          {connectedSessions.map((session) => (
            <div
              key={session.sessionId}
              onClick={() => switchSession(session.sessionId)}
              className={`mx-2 mb-2 cursor-pointer transition-all ${selectedSession === session.sessionId
                ? 'ring-2 ring-[#00a884] rounded-full'
                : 'opacity-60 hover:opacity-100'
                }`}
              title={session.name || session.phoneNumber || 'WhatsApp'}
            >
              <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center overflow-hidden">
                <span className="text-[#111b21] font-bold text-lg">
                  {(session.name || 'W').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          ))}

          {/* Add New Session Button */}
          <div
            onClick={() => navigate('/whatsapp')}
            className="mx-2 mb-2 cursor-pointer opacity-60 hover:opacity-100 transition-all"
            title="Add WhatsApp Account"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#8696a0] flex items-center justify-center hover:border-[#00a884] transition-colors">
              <Plus className="w-5 h-5 text-[#8696a0]" />
            </div>
          </div>
        </div>

        {/* Sessions Count */}
        <div className="p-2 border-t border-[#2a3942] text-center">
          <span className="text-[#8696a0] text-xs">{connectedSessions.length}</span>
        </div>
      </div>

      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-[#111b21] border-r border-[#2a3942] flex flex-col">
        {/* Header */}
        <div className="h-[59px] px-4 bg-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
              {myProfile?.profilePicUrl ? (
                <img
                  src={myProfile.profilePicUrl}
                  alt="My Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center bg-[#00a884]"
                style={{ display: myProfile?.profilePicUrl ? 'none' : 'flex' }}
              >
                <User className="w-6 h-6 text-[#111b21]" />
              </div>
            </div>
            {/* Account Name Display */}
            <div className="flex-1">
              <h1 className="text-[#00ff66] font-bold text-base truncate">
                {connectedSessions.find(s => s.sessionId === selectedSession)?.name || 'WhatsApp'}
              </h1>
              <p className="text-[#8696a0] text-xs">
                {connectedSessions.length} account{connectedSessions.length > 1 ? 's' : ''} connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative menu-container">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#aebac1]" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-12 w-64 bg-[#233138] rounded-md shadow-lg py-2 z-50 border border-[#2a3942]">
                  <button
                    onClick={handleNewGroup}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <Users className="w-5 h-5 text-[#aebac1]" />
                    <span>New group</span>
                  </button>
                  <button
                    onClick={handleNewCommunity}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <Users className="w-5 h-5 text-[#aebac1]" />
                    <span>New community</span>
                  </button>
                  <button
                    onClick={handleStarredMessages}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <Star className="w-5 h-5 text-[#aebac1]" />
                    <span>Starred messages</span>
                  </button>
                  <button
                    onClick={handleSelectChats}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <CheckSquare className="w-5 h-5 text-[#aebac1]" />
                    <span>{selectMode ? 'Cancel selection' : 'Select chats'}</span>
                  </button>
                  <div className="border-t border-[#2a3942] my-1"></div>
                  <button
                    onClick={() => { setShowSettings(true); setShowMenu(false); }}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <Settings className="w-5 h-5 text-[#aebac1]" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3 text-[14.5px]"
                  >
                    <LogOut className="w-5 h-5 text-[#aebac1]" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-[#111b21]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-[#202c33] text-[#d1d7db] placeholder-[#8696a0] rounded-lg focus:outline-none text-sm"
            />
            {checkingNumber && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00a884] animate-spin" />
            )}
          </div>
        </div>

        {/* Number Check Result */}
        {numberCheckResult && !checkingNumber && (
          <div className="px-3 py-2 bg-[#111b21] border-b border-[#2a3942]">
            {numberCheckResult.exists ? (
              <div
                onClick={openChatWithNumber}
                className="flex items-center gap-3 p-3 bg-[#202c33] rounded-lg cursor-pointer hover:bg-[#2a3942] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center">
                  {numberCheckResult.profilePicUrl ? (
                    <img
                      src={numberCheckResult.profilePicUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[#e9edef] font-medium">
                    {numberCheckResult.name || `+${numberCheckResult.phoneNumber}`}
                  </p>
                  <p className="text-[#00a884] text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#00a884] rounded-full"></span>
                    Has WhatsApp - Click to chat
                  </p>
                </div>
                <MessageCircle className="w-5 h-5 text-[#00a884]" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-[#202c33] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[#374248] flex items-center justify-center">
                  <User className="w-6 h-6 text-[#8696a0]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#8696a0]">+{searchQuery.replace(/[^0-9]/g, '')}</p>
                  <p className="text-[#ea4335] text-sm">Not on WhatsApp</p>
                </div>
                <X className="w-5 h-5 text-[#ea4335]" />
              </div>
            )}
          </div>
        )}

        {/* Select Mode Header */}
        {selectMode && (
          <div className="px-4 py-2 bg-[#202c33] flex items-center justify-between border-b border-[#2a3942]">
            <span className="text-[#d1d7db] text-sm">{selectedChats.length} selected</span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelectedChats}
                disabled={selectedChats.length === 0}
                className="px-3 py-1 bg-[#ea4335] text-white rounded text-sm disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={() => { setSelectMode(false); setSelectedChats([]); }}
                className="px-3 py-1 bg-[#2a3942] text-[#d1d7db] rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-[#111b21]">
          {chatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-[#8696a0]">
              {showSyncing ? (
                <>
                  <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Synchronizing chats...</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-[#374248]" />
                  <p>No conversations found</p>
                </>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => selectMode ? toggleChatSelection(chat.id) : setSelectedChat(chat.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#2a3942]/30 ${selectedChat === chat.id ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                  } ${selectedChats.includes(chat.id) ? 'bg-[#00a884]/20' : ''}`}
              >
                {selectMode && (
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedChats.includes(chat.id) ? 'bg-[#00a884] border-[#00a884]' : 'border-[#8696a0]'
                    }`}>
                    {selectedChats.includes(chat.id) && <span className="text-white text-xs">✓</span>}
                  </div>
                )}
                <div className="relative flex-shrink-0">
                  {chat.profilePicUrl ? (
                    <img
                      src={chat.profilePicUrl}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center"
                    style={{ display: chat.profilePicUrl ? 'none' : 'flex' }}
                  >
                    {chat.isGroup ? (
                      <Users className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#00a884] text-[#111b21] text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-normal text-[#e9edef] truncate">{chat.name}</h3>
                    <span className="text-xs text-[#8696a0]">{formatTime(chat.timestamp)}</span>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-[#8696a0] truncate flex items-center gap-1">
                      {chat.lastMessage.fromMe && (
                        <span className={`${chat.lastMessage.ack >= 3 ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`}>
                          {chat.lastMessage.ack === 0 ? '⏳' : chat.lastMessage.ack === 1 ? '✓' : '✓✓'}
                        </span>
                      )}
                      {chat.lastMessage.body || <span className="italic">{chat.lastMessage.type}</span>}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[59px] bg-[#202c33] px-4 flex items-center justify-between border-l border-[#2a3942]">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 hover:bg-[#2a3942] rounded-full"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
                </button>

                {(() => {
                  const chat = filteredChats.find(c => c.id === selectedChat);
                  return chat ? (
                    <>
                      <div className="relative w-10 h-10 flex-shrink-0">
                        {chat.profilePicUrl ? (
                          <img
                            src={chat.profilePicUrl}
                            alt={chat.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center absolute top-0 left-0"
                          style={{ display: chat.profilePicUrl ? 'none' : 'flex' }}
                        >
                          {chat.isGroup ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h2 className="font-normal text-[#e9edef]">{chat.name}</h2>
                        <p className="text-xs text-[#8696a0]">
                          {chat.isGroup ? 'Group chat' : 'Contact'}
                        </p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceCall}
                  className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  title="Voice call"
                >
                  <Phone className="w-5 h-5 text-[#aebac1]" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  title="Video call"
                >
                  <Video className="w-5 h-5 text-[#aebac1]" />
                </button>
                <button
                  onClick={handleSearchInChat}
                  className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5 text-[#aebac1]" />
                </button>
                <div className="relative menu-container">
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-[#aebac1]" />
                  </button>

                  {showChatMenu && (
                    <div className="absolute right-0 top-12 w-64 bg-[#233138] rounded-md shadow-lg py-2 z-50 border border-[#2a3942]">
                      <button
                        onClick={handleContactInfo}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Contact info
                      </button>
                      <button
                        onClick={handleCloseChat}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Close chat
                      </button>
                      <button
                        onClick={handleMuteNotifications}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        {isMuted ? 'Unmute notifications' : 'Mute notifications'}
                      </button>
                      <button
                        onClick={handleDisappearingMessages}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Disappearing messages
                      </button>
                      <button
                        onClick={() => { setMessageSelectMode(true); setShowChatMenu(false); }}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Select messages
                      </button>
                      <button
                        onClick={handleClearChat}
                        className="w-full px-6 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Clear chat
                      </button>
                      <button
                        onClick={handleDeleteChat}
                        className="w-full px-6 py-3 text-left text-[#ea4335] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Delete chat
                      </button>
                      <button
                        onClick={handleReportContact}
                        className="w-full px-6 py-3 text-left text-[#ea4335] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Report
                      </button>
                      <button
                        onClick={handleBlockContact}
                        className="w-full px-6 py-3 text-left text-[#ea4335] hover:bg-[#182229] transition-colors text-[14.5px]"
                      >
                        Block
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#0b141a] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0yMCAyMG0tMSAwYTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMCIgZmlsbD0iIzFmMmUzNyIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjcCkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')]">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messagesData?.messages?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#8696a0]">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-2 text-[#374248]" />
                    <p>No messages yet</p>
                  </div>
                </div>
              ) : (
                <>
                  {allMessages.map((msg) => (
                    <div
                      key={msg.id._serialized || msg.id}
                      className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-3 py-2 ${msg.fromMe
                          ? 'bg-[#005c4b] ml-auto rounded-tr-none'
                          : 'bg-[#202c33] rounded-tl-none'
                          } rounded-lg shadow-sm`}
                      >
                        {msg.hasMedia && msg.media && (
                          <div className="mb-2">
                            {msg.media.mimetype?.startsWith('image/') ? (
                              <img
                                src={`data:${msg.media.mimetype};base64,${msg.media.data}`}
                                alt="Media"
                                className="max-w-full rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{msg.media.filename || 'File'}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-[#e9edef] whitespace-pre-wrap break-words text-[14.2px]">{msg.body}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-[#8696a0]">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.fromMe && (
                            <span className="text-xs ml-1">
                              {msg.ack === 0 ? (
                                <span className="text-[#8696a0]">⏳</span>
                              ) : msg.ack === 1 ? (
                                <span className="text-[#8696a0]">✓</span>
                              ) : msg.ack === 2 ? (
                                <span className="text-[#8696a0]">✓✓</span>
                              ) : msg.ack >= 3 ? (
                                <span className="text-[#53bdeb]">✓✓</span>
                              ) : (
                                <span className="text-[#8696a0]">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-[#202c33] p-3">
              {/* Message Select Mode Header */}
              {messageSelectMode && (
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-[#d1d7db] text-sm">{selectedMessages.length} selected</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStarMessages}
                      disabled={selectedMessages.length === 0}
                      className="p-2 hover:bg-[#2a3942] rounded-full disabled:opacity-50"
                      title="Star"
                    >
                      <Star className="w-5 h-5 text-[#8696a0]" />
                    </button>
                    <button
                      onClick={handleCopyMessages}
                      disabled={selectedMessages.length === 0}
                      className="p-2 hover:bg-[#2a3942] rounded-full disabled:opacity-50"
                      title="Copy"
                    >
                      <Copy className="w-5 h-5 text-[#8696a0]" />
                    </button>
                    <button
                      onClick={handleForwardMessages}
                      disabled={selectedMessages.length === 0}
                      className="p-2 hover:bg-[#2a3942] rounded-full disabled:opacity-50"
                      title="Forward"
                    >
                      <Forward className="w-5 h-5 text-[#8696a0]" />
                    </button>
                    <button
                      onClick={handleDeleteMessages}
                      disabled={selectedMessages.length === 0}
                      className="p-2 hover:bg-[#2a3942] rounded-full disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-[#ea4335]" />
                    </button>
                    <button
                      onClick={() => { setMessageSelectMode(false); setSelectedMessages([]); }}
                      className="px-3 py-1 bg-[#2a3942] text-[#d1d7db] rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Search in Chat */}
              {showSearchInChat && (
                <div className="flex items-center gap-2 mb-3 px-2">
                  <input
                    type="text"
                    value={searchInChat}
                    onChange={(e) => setSearchInChat(e.target.value)}
                    placeholder="Search in conversation..."
                    className="flex-1 px-4 py-2 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg focus:outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearchInChat(false)}
                    className="p-2 hover:bg-[#2a3942] rounded-full"
                  >
                    <X className="w-5 h-5 text-[#8696a0]" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Emoji Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    <Smile className="w-6 h-6 text-[#8696a0]" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 bg-[#233138] rounded-lg shadow-lg p-3 z-50 border border-[#2a3942]">
                      <div className="grid grid-cols-5 gap-2">
                        {emojis.map((emoji, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 text-xl hover:bg-[#2a3942] rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachment Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    <Paperclip className="w-6 h-6 text-[#8696a0]" />
                  </button>

                  {showAttachMenu && (
                    <div className="absolute bottom-12 left-0 bg-[#233138] rounded-lg shadow-lg py-2 z-50 border border-[#2a3942] w-48">
                      <button
                        type="button"
                        onClick={() => handleFileSelect('document')}
                        className="w-full px-4 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3"
                      >
                        <File className="w-5 h-5 text-[#7f66ff]" />
                        <span>Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileSelect('photo')}
                        className="w-full px-4 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3"
                      >
                        <Image className="w-5 h-5 text-[#007bfc]" />
                        <span>Photos & Videos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFileSelect('camera')}
                        className="w-full px-4 py-3 text-left text-[#d1d7db] hover:bg-[#182229] transition-colors flex items-center gap-3"
                      >
                        <Camera className="w-5 h-5 text-[#ff2e74]" />
                        <span>Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex-1 flex items-center bg-[#2a3942] rounded-lg px-3 py-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 px-3 py-1 bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none text-[15px]"
                  />
                </div>

                {/* AI Model Selector + Generate Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAiModelMenu(!showAiModelMenu)}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition-colors group flex items-center gap-1"
                    title={`AI: ${aiModels.find(m => m.id === selectedAiModel)?.name || 'Select'}`}
                  >
                    <span className="text-lg">{aiModels.find(m => m.id === selectedAiModel)?.icon || '🤖'}</span>
                    <ChevronDown className="w-3 h-3 text-[#8696a0]" />
                  </button>

                  {/* AI Model Dropdown Menu */}
                  {showAiModelMenu && (
                    <div className="absolute bottom-12 right-0 bg-[#233138] rounded-xl shadow-2xl py-2 z-50 border border-[#2a3942] w-72 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-[#2a3942]">
                        <h3 className="text-[#00a884] font-bold text-sm">Choose AI Model</h3>
                        <p className="text-[#8696a0] text-xs">For message responses</p>
                      </div>
                      {aiModels.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedAiModel(model.id);
                            localStorage.setItem('meIA_selectedModel', model.id);
                            setShowAiModelMenu(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-[#182229] transition-colors flex items-center gap-3 ${selectedAiModel === model.id ? 'bg-[#00a884]/10 border-l-2 border-[#00a884]' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                            {model.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${selectedAiModel === model.id ? 'text-[#00a884]' : 'text-[#d1d7db]'}`}>
                                {model.name}
                              </span>
                              {model.recommended && (
                                <span className="px-1.5 py-0.5 bg-[#00a884] text-[#111b21] text-[10px] font-bold rounded">⭐</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#8696a0] text-xs">{model.provider}</span>
                              <span className="text-[#8696a0] text-xs">•</span>
                              <span className="text-[#8696a0] text-xs">{model.desc}</span>
                            </div>
                            {/* Capabilities tags */}
                            <div className="flex flex-wrap gap-1">
                              {model.capabilities?.map((cap, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-[#2a3942] text-[#aebac1] text-[9px] rounded-full">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                          {selectedAiModel === model.id && (
                            <div className="w-5 h-5 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                              <span className="text-[#111b21] text-xs font-bold">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Generate Button */}
                <button
                  type="button"
                  onClick={() => handleGenerateAI()}
                  disabled={aiGenerating}
                  className="p-2 hover:bg-[#2a3942] rounded-full transition-colors group relative"
                  title="Generate AI Response"
                >
                  {aiGenerating ? (
                    <div className="w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-6 h-6 text-[#a855f7] group-hover:text-[#c084fc]" />
                  )}
                </button>

                {/* Schedule Button */}
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="p-2 hover:bg-[#2a3942] rounded-full transition-colors group"
                  title="Schedule Message"
                >
                  <Calendar className="w-6 h-6 text-[#f59e0b] group-hover:text-[#fbbf24]" />
                </button>

                {messageText.trim() ? (
                  <button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-6 h-6 text-[#8696a0]" />
                    )}
                  </button>
                ) : (
                  <button type="button" className="p-2 hover:bg-[#2a3942] rounded-full transition-colors">
                    <Mic className="w-6 h-6 text-[#8696a0]" />
                  </button>
                )}
              </form>

              {/* AI Assistant Panel - Compact Chat */}
              {showAiPanel && (
                <div className="absolute bottom-20 right-4 w-[640px] bg-[#233138] rounded-lg border border-[#a855f7]/30 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#a855f7]/20 to-[#7c3aed]/20 border-b border-[#2a3942]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#a855f7]" />
                      <span className="text-[#e9edef] font-medium text-sm">AI Assistant - Command Center</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setShowScriptsList(!showScriptsList); loadScripts(); }}
                        className={`px-2 py-1 text-xs rounded ${showScriptsList ? 'bg-[#a855f7] text-white' : 'bg-[#2a3942] text-[#8696a0]'} hover:bg-[#a855f7] hover:text-white`}
                      >
                        📜 Scripts
                      </button>
                      <button onClick={() => setShowAiPanel(false)} className="text-[#8696a0] hover:text-[#e9edef]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scripts List Panel */}
                  {showScriptsList && (
                    <div className="border-b border-[#2a3942] p-3 bg-[#1a2229]">
                      <p className="text-[#8696a0] text-xs mb-2">Select a script to run:</p>
                      {availableScripts.length === 0 ? (
                        <p className="text-[#8696a0] text-xs text-center py-2">No scripts available. Create one in Scripts page.</p>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {availableScripts.map(script => (
                            <button
                              key={script.id}
                              onClick={() => runScriptOnChat(script)}
                              disabled={runningScript}
                              className={`w-full text-left px-3 py-2 bg-[#2a3942] hover:bg-[#374248] rounded text-sm flex items-center justify-between ${runningScript ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div>
                                <span className="text-[#e9edef]">📜 {script.name}</span>
                                <span className="text-[#8696a0] text-xs ml-2">({script.messages?.length} msgs)</span>
                              </div>
                              <span className="text-[#a855f7] text-xs">{runningScript ? '⏳...' : '▶ Run'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 max-h-64 overflow-y-auto">
                    {aiGenerating ? (
                      <div className="flex items-center gap-2 text-[#8696a0] text-sm">
                        <div className="w-3 h-3 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : aiSuggestion ? (
                      <div className="space-y-2">
                        <div className="bg-[#a855f7]/10 rounded-lg p-3 border-l-2 border-[#a855f7]">
                          <p className="text-[#e9edef] text-sm whitespace-pre-wrap">{aiSuggestion}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={useAiSuggestion}
                            className="flex-1 px-3 py-1.5 bg-[#a855f7] text-white rounded text-xs hover:bg-[#9333ea]"
                          >
                            Use This
                          </button>
                          <button
                            onClick={() => handleGenerateAI()}
                            className="px-3 py-1.5 bg-[#2a3942] text-[#e9edef] rounded text-xs hover:bg-[#374248]"
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#8696a0] text-sm text-center py-2">
                        Give your instructions below or click ✨ to analyze the last message
                      </p>
                    )}
                  </div>
                  {/* Input to give orders to the AI */}
                  <form onSubmit={handleAiCommand} className="p-3 border-t border-[#2a3942]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Give your commands to the AI..."
                        className="flex-1 px-3 py-2 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg border border-[#374248] focus:border-[#a855f7] outline-none text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!aiInput.trim() || aiGenerating}
                        className="px-4 py-2 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Schedule Modal - Compact */}
              {showScheduleModal && (
                <div className="absolute bottom-20 right-4 w-72 bg-[#233138] rounded-lg border border-[#f59e0b]/30 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f59e0b]/20 to-[#d97706]/20 border-b border-[#2a3942]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#f59e0b]" />
                      <span className="text-[#e9edef] font-medium text-sm">Schedule Message</span>
                    </div>
                    <button onClick={() => setShowScheduleModal(false)} className="text-[#8696a0] hover:text-[#e9edef]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Message..."
                      rows={2}
                      className="w-full px-2 py-1.5 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded border border-[#374248] focus:border-[#f59e0b] outline-none resize-none text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="px-2 py-1.5 bg-[#2a3942] text-[#e9edef] rounded border border-[#374248] focus:border-[#f59e0b] outline-none text-xs"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="px-2 py-1.5 bg-[#2a3942] text-[#e9edef] rounded border border-[#374248] focus:border-[#f59e0b] outline-none text-xs"
                      />
                    </div>
                    <button
                      onClick={handleScheduleMessage}
                      disabled={!messageText.trim() || !scheduleDate || !scheduleTime}
                      className="w-full px-3 py-1.5 bg-[#f59e0b] text-white rounded text-sm hover:bg-[#d97706] disabled:opacity-50"
                    >
                      Programmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#0b141a] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0yMCAyMG0tMSAwYTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMCIgZmlsbD0iIzFmMmUzNyIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjcCkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')]">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 border-4 border-[#00a884] rounded-full flex items-center justify-center">
                <MessageCircle className="w-32 h-32 text-[#00a884]" />
              </div>
              <h2 className="text-2xl font-normal text-[#e9edef] mb-2">WhatsApp Web</h2>
              <p className="text-[#8696a0]">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info Panel */}
      {showContactInfo && selectedChat && (
        <div className="w-96 bg-[#111b21] border-l border-[#2a3942] flex flex-col">
          <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4">
            <button
              onClick={() => setShowContactInfo(false)}
              className="p-2 hover:bg-[#2a3942] rounded-full"
            >
              <X className="w-5 h-5 text-[#aebac1]" />
            </button>
            <h2 className="text-[#e9edef] font-medium">Contact info</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {(() => {
              const chat = filteredChats.find(c => c.id === selectedChat);
              return chat ? (
                <>
                  <div className="flex flex-col items-center py-8 bg-[#111b21]">
                    <div className="w-48 h-48 rounded-full overflow-hidden mb-4">
                      {chat.profilePicUrl ? (
                        <img
                          src={chat.profilePicUrl}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-[#6b7c85] flex items-center justify-center"
                        style={{ display: chat.profilePicUrl ? 'none' : 'flex' }}
                      >
                        {chat.isGroup ? (
                          <Users className="w-24 h-24 text-white" />
                        ) : (
                          <User className="w-24 h-24 text-white" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl text-[#e9edef] font-normal">{chat.name}</h3>
                    <p className="text-[#8696a0] text-sm mt-1">
                      {chat.isGroup ? 'Group' : chat.id.replace('@c.us', '')}
                    </p>
                  </div>

                  <div className="border-t border-[#2a3942] bg-[#111b21] p-4">
                    <p className="text-[#8696a0] text-xs mb-1">About</p>
                    <p className="text-[#e9edef] text-sm">Hey there! I am using WhatsApp.</p>
                  </div>

                  <div className="border-t border-[#2a3942] bg-[#111b21]">
                    <button
                      onClick={() => { setIsMuted(!isMuted); }}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors"
                    >
                      <VolumeX className="w-5 h-5 text-[#8696a0]" />
                      <span className="text-[#e9edef]">{isMuted ? 'Unmute notifications' : 'Mute notifications'}</span>
                    </button>

                    <button
                      onClick={handleBlockContact}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors"
                    >
                      <Ban className="w-5 h-5 text-[#ea4335]" />
                      <span className="text-[#ea4335]">Block {chat.name}</span>
                    </button>

                    <button
                      onClick={handleReportContact}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors"
                    >
                      <AlertTriangle className="w-5 h-5 text-[#ea4335]" />
                      <span className="text-[#ea4335]">Report {chat.name}</span>
                    </button>

                    <button
                      onClick={handleDeleteChat}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-[#ea4335]" />
                      <span className="text-[#ea4335]">Delete chat</span>
                    </button>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#3b4a54] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-[#e9edef] text-lg font-medium mb-2">
              {showConfirmModal === 'clear' && 'Clear this chat?'}
              {showConfirmModal === 'delete' && 'Delete this chat?'}
              {showConfirmModal === 'block' && 'Block this contact?'}
              {showConfirmModal === 'report' && 'Report this contact?'}
            </h3>
            <p className="text-[#8696a0] text-sm mb-6">
              {showConfirmModal === 'clear' && 'Messages will be removed from this device only.'}
              {showConfirmModal === 'delete' && 'This chat will be deleted from your chat list.'}
              {showConfirmModal === 'block' && 'Blocked contacts cannot send you messages or see your status.'}
              {showConfirmModal === 'report' && 'The last 5 messages will be forwarded to WhatsApp for review.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-[#00a884] hover:bg-[#2a3942] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-[#00a884] text-[#111b21] rounded hover:bg-[#00c896] transition-colors"
              >
                {showConfirmModal === 'clear' && 'Clear'}
                {showConfirmModal === 'delete' && 'Delete'}
                {showConfirmModal === 'block' && 'Block'}
                {showConfirmModal === 'report' && 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#3b4a54] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#e9edef] text-lg font-medium">New Group</h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 hover:bg-[#2a3942] rounded"
              >
                <X className="w-5 h-5 text-[#aebac1]" />
              </button>
            </div>
            <div className="mb-4">
              <label className="text-[#8696a0] text-sm block mb-2">Group name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="text-[#8696a0] text-sm block mb-2">Add participants</label>
              <div className="max-h-48 overflow-y-auto bg-[#2a3942] rounded-lg">
                {filteredChats.filter(c => !c.isGroup).slice(0, 10).map(chat => (
                  <div key={chat.id} className="flex items-center gap-3 px-4 py-2 hover:bg-[#374248] cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[#6b7c85] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#e9edef] text-sm">{chat.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="px-4 py-2 text-[#00a884] hover:bg-[#2a3942] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Group "${newGroupName}" would be created (feature requires WhatsApp API)`);
                  setShowNewGroupModal(false);
                  setNewGroupName('');
                }}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 bg-[#00a884] text-[#111b21] rounded hover:bg-[#00c896] transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Starred Messages Panel */}
      {showStarredMessages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowStarredMessages(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <X className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Starred messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col items-center justify-center py-12 text-[#8696a0]">
                <Star className="w-16 h-16 mb-4 text-[#374248]" />
                <p className="text-center">No starred messages</p>
                <p className="text-center text-sm mt-2">Tap and hold on any message to star it</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            {(() => {
              const chat = filteredChats.find(c => c.id === selectedChat);
              return (
                <>
                  <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                    {chat?.profilePicUrl ? (
                      <img
                        src={chat.profilePicUrl}
                        alt={chat?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-[#6b7c85] flex items-center justify-center"
                      style={{ display: chat?.profilePicUrl ? 'none' : 'flex' }}
                    >
                      <User className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl text-white mb-2">{chat?.name}</h2>
                  <p className="text-[#8696a0] mb-8">
                    {showCallModal === 'voice' ? 'Voice call' : 'Video call'}
                  </p>
                  <p className="text-[#8696a0] text-sm mb-8 animate-pulse">
                    Calling...
                  </p>
                  <div className="flex justify-center gap-8">
                    {showCallModal === 'video' && (
                      <button className="w-14 h-14 rounded-full bg-[#3b4a54] flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </button>
                    )}
                    <button className="w-14 h-14 rounded-full bg-[#3b4a54] flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => setShowCallModal(null)}
                      className="w-14 h-14 rounded-full bg-[#ea4335] flex items-center justify-center"
                    >
                      <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
                    </button>
                  </div>
                  <p className="text-[#8696a0] text-xs mt-8">
                    Note: Calls require WhatsApp desktop app
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Settings</h2>
            </div>

            {/* Profile Section */}
            <div className="p-4 flex items-center gap-4 hover:bg-[#202c33] cursor-pointer border-b border-[#2a3942]">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#00a884] flex items-center justify-center">
                {myProfile?.profilePicUrl ? (
                  <img
                    src={myProfile.profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#111b21]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[#e9edef] font-medium">{myProfile?.name || 'My Profile'}</h3>
                <p className="text-[#8696a0] text-sm">Hey there! I am using WhatsApp.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Notifications */}
              <button
                onClick={() => { setShowSettings(false); setShowNotifications(true); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors border-b border-[#2a3942]/50"
              >
                <Bell className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Notifications</span>
                  <p className="text-[#8696a0] text-xs">Message, group & call tones</p>
                </div>
              </button>

              {/* Privacy */}
              <button
                onClick={() => { setShowSettings(false); setShowPrivacy(true); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors border-b border-[#2a3942]/50"
              >
                <Lock className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Privacy</span>
                  <p className="text-[#8696a0] text-xs">Block contacts, disappearing messages</p>
                </div>
              </button>

              {/* Security */}
              <button
                onClick={() => { setShowSettings(false); setShowSecurity(true); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors border-b border-[#2a3942]/50"
              >
                <Key className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Security</span>
                  <p className="text-[#8696a0] text-xs">Security notifications, linked devices</p>
                </div>
              </button>

              {/* Linked Devices */}
              <button
                onClick={() => { setShowSettings(false); navigate('/whatsapp'); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors border-b border-[#2a3942]/50"
              >
                <Smartphone className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Linked Devices</span>
                  <p className="text-[#8696a0] text-xs">Manage WhatsApp sessions</p>
                </div>
              </button>

              {/* Help */}
              <button
                onClick={() => { setShowSettings(false); setShowHelp(true); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors border-b border-[#2a3942]/50"
              >
                <HelpCircle className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Help</span>
                  <p className="text-[#8696a0] text-xs">Help center, contact us, privacy policy</p>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] transition-colors"
              >
                <LogOut className="w-5 h-5 text-[#ea4335]" />
                <span className="text-[#ea4335]">Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Notifications</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#2a3942]">
                <div>
                  <p className="text-[#e9edef]">Message sounds</p>
                  <p className="text-[#8696a0] text-xs">Play sounds for incoming messages</p>
                </div>
                <button
                  onClick={() => setNotificationSettings({ ...notificationSettings, sounds: !notificationSettings.sounds })}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.sounds ? 'bg-[#00a884]' : 'bg-[#3b4a54]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationSettings.sounds ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#2a3942]">
                <div>
                  <p className="text-[#e9edef]">Desktop notifications</p>
                  <p className="text-[#8696a0] text-xs">Show notifications on desktop</p>
                </div>
                <button
                  onClick={() => setNotificationSettings({ ...notificationSettings, desktop: !notificationSettings.desktop })}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.desktop ? 'bg-[#00a884]' : 'bg-[#3b4a54]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationSettings.desktop ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[#e9edef]">Show previews</p>
                  <p className="text-[#8696a0] text-xs">Show message preview in notifications</p>
                </div>
                <button
                  onClick={() => setNotificationSettings({ ...notificationSettings, preview: !notificationSettings.preview })}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationSettings.preview ? 'bg-[#00a884]' : 'bg-[#3b4a54]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationSettings.preview ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Privacy</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="py-3 border-b border-[#2a3942]">
                <p className="text-[#e9edef] mb-2">Last seen</p>
                <select
                  value={privacySettings.lastSeen}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, lastSeen: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2a3942] text-[#e9edef] rounded-lg outline-none"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
              <div className="py-3 border-b border-[#2a3942]">
                <p className="text-[#e9edef] mb-2">Profile photo</p>
                <select
                  value={privacySettings.profilePhoto}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, profilePhoto: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2a3942] text-[#e9edef] rounded-lg outline-none"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
              <div className="py-3 border-b border-[#2a3942]">
                <p className="text-[#e9edef] mb-2">About</p>
                <select
                  value={privacySettings.about}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, about: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2a3942] text-[#e9edef] rounded-lg outline-none"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[#e9edef]">Read receipts</p>
                  <p className="text-[#8696a0] text-xs">Show when you've read messages</p>
                </div>
                <button
                  onClick={() => setPrivacySettings({ ...privacySettings, readReceipts: !privacySettings.readReceipts })}
                  className={`w-12 h-6 rounded-full transition-colors ${privacySettings.readReceipts ? 'bg-[#00a884]' : 'bg-[#3b4a54]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${privacySettings.readReceipts ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecurity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowSecurity(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Security</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-[#202c33] rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-8 h-8 text-[#00a884]" />
                  <div>
                    <p className="text-[#e9edef] font-medium">End-to-end encrypted</p>
                    <p className="text-[#8696a0] text-xs">Messages are secured</p>
                  </div>
                </div>
                <p className="text-[#8696a0] text-sm">
                  Your personal messages are end-to-end encrypted. Not even WhatsApp can read or listen to them.
                </p>
              </div>
              <button
                onClick={() => { setShowSecurity(false); navigate('/whatsapp'); }}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] rounded-lg transition-colors"
              >
                <Smartphone className="w-5 h-5 text-[#8696a0]" />
                <div className="flex-1 text-left">
                  <span className="text-[#e9edef]">Linked devices</span>
                  <p className="text-[#8696a0] text-xs">Manage your connected devices</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b21] rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="h-[59px] px-4 bg-[#202c33] flex items-center gap-4 rounded-t-lg">
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-[#2a3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-[#aebac1]" />
              </button>
              <h2 className="text-[#e9edef] font-medium">Help</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] rounded-lg transition-colors mb-2">
                <HelpCircle className="w-5 h-5 text-[#8696a0]" />
                <span className="text-[#e9edef]">Help Center</span>
              </button>
              <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] rounded-lg transition-colors mb-2">
                <MessageSquare className="w-5 h-5 text-[#8696a0]" />
                <span className="text-[#e9edef]">Contact us</span>
              </button>
              <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#202c33] rounded-lg transition-colors mb-2">
                <Info className="w-5 h-5 text-[#8696a0]" />
                <span className="text-[#e9edef]">Terms and Privacy Policy</span>
              </button>
              <div className="mt-6 text-center text-[#8696a0] text-sm">
                <p>WhatsApp Platform</p>
                <p className="text-xs mt-1">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disappearing Messages Modal */}
      {showDisappearingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#3b4a54] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-[#e9edef] text-lg font-medium mb-4">Disappearing messages</h3>
            <p className="text-[#8696a0] text-sm mb-4">
              When turned on, new messages will disappear after the selected duration.
            </p>
            <div className="space-y-2">
              {[
                { value: '24h', label: '24 hours' },
                { value: '7d', label: '7 days' },
                { value: '90d', label: '90 days' },
                { value: 'off', label: 'Off' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDisappearingOption(option.value)}
                  className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center justify-between ${disappearingMessages === option.value ? 'bg-[#00a884] text-[#111b21]' : 'bg-[#2a3942] text-[#e9edef] hover:bg-[#374248]'
                    }`}
                >
                  <span>{option.label}</span>
                  {disappearingMessages === option.value && <span>✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDisappearingModal(false)}
              className="w-full mt-4 px-4 py-2 text-[#00a884] hover:bg-[#2a3942] rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
