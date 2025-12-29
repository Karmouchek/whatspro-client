import { useState, useEffect, useRef } from 'react';
import { Send, User, Phone, Globe, FileText, MessageSquare, CheckCircle, AlertCircle, Upload, X, Calendar, Clock, Plus, Edit2, Trash2, Save, Paperclip, File, Image, Film, Music } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';

export default function SendMessage() {
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    countryCode: '',
    messageType: 'text', // 'text' or 'template' - Text default for whatsapp-web.js
    message: '',
    templateName: '',
    variables: ['', '', '']
  });

  // File attachment state
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const mediaInputRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedSenderNumber, setSelectedSenderNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [senderNumberError, setSenderNumberError] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', content: '' });
  const fileInputRef = useRef(null);

  // Validate phone number format (E.164 international format)
  const validatePhoneNumber = (phone) => {
    if (!phone) return '';
    // E.164 format: + followed by 7-15 digits
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!phone.startsWith('+')) {
      return 'Number must start with + (e.g., +33612345678)';
    }
    if (!e164Regex.test(phone)) {
      return 'Invalid format. Use international format (e.g., +33612345678)';
    }
    return '';
  };

  const handleSenderNumberChange = (value) => {
    setSelectedSenderNumber(value);
    if (value) {
      setSenderNumberError(validatePhoneNumber(value));
    } else {
      setSenderNumberError('');
    }
  };

  // Load initial data
  useEffect(() => {
    loadContacts();
    loadCountries();
    loadTemplates();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await api.get('/single-message/contacts?limit=20');
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]); // Initialize with empty array on error
    }
  };

  const loadCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error loading countries:', error);
      setCountries([]);
    }
  };

  const loadTemplates = async () => {
    try {
      // Load custom templates from localStorage
      const savedTemplates = localStorage.getItem('customTemplates');
      const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];

      // Default templates
      const defaultTemplates = [
        { name: 'hello_world', description: 'Simple welcome message', content: 'Hello {{1}}!', isDefault: true },
        { name: 'welcome_client', description: 'Welcome new customer', content: 'Welcome {{1}} {{2}}! We are happy to have you.', isDefault: true },
        { name: 'order_confirmation', description: 'Order confirmation', content: 'Hi {{1}}, your order #{{2}} has been confirmed.', isDefault: true },
        { name: 'payment_reminder', description: 'Payment reminder', content: 'Hello {{1}}, this is a reminder for your payment of {{2}}.', isDefault: true },
      ];

      setTemplates([...customTemplates, ...defaultTemplates]);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.content) {
      setError('Template name and content are required');
      return;
    }

    const savedTemplates = localStorage.getItem('customTemplates');
    let customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];

    if (editingTemplate) {
      // Update existing template
      customTemplates = customTemplates.map(t =>
        t.name === editingTemplate.name ? { ...templateForm, isDefault: false } : t
      );
    } else {
      // Check if name already exists
      if (templates.some(t => t.name === templateForm.name)) {
        setError('A template with this name already exists');
        return;
      }
      // Add new template
      customTemplates.push({ ...templateForm, isDefault: false });
    }

    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
    loadTemplates();
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateForm({ name: '', description: '', content: '' });
    setError(null);
  };

  const deleteTemplate = (templateName) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const savedTemplates = localStorage.getItem('customTemplates');
    let customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
    customTemplates = customTemplates.filter(t => t.name !== templateName);
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
    loadTemplates();

    if (formData.templateName === templateName) {
      setFormData({ ...formData, templateName: '' });
    }
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      content: template.content || ''
    });
    setShowTemplateModal(true);
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', description: '', content: '' });
    setShowTemplateModal(true);
  };

  const handleContactSelect = (contact) => {
    setFormData({
      ...formData,
      phone: contact.phone,
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      countryCode: contact.country_code || ''
    });

    // Load avatar if available
    if (contact.profile_picture) {
      setAvatarPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/single-message/avatar/${contact.profile_picture}`);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must not exceed 5MB');
      return;
    }

    // Check that a phone number is entered
    if (!formData.phone) {
      setError('Please enter a phone number first');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    setError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await api.post(`/single-message/upload-avatar/${encodeURIComponent(formData.phone)}`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Avatar uploaded:', response);
      // Reload contacts
      loadContacts();

    } catch (err) {
      setError(err.response?.data?.error || 'Error during upload');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!formData.phone) return;

    try {
      await api.delete(`/single-message/avatar/${encodeURIComponent(formData.phone)}`);
      setAvatarPreview(null);
      loadContacts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error during deletion');
    }
  };

  // File attachment handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Max 16MB for WhatsApp
    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB');
      return;
    }

    setAttachedFile(file);

    // Create preview for images/videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype?.startsWith('image/')) return Image;
    if (mimetype?.startsWith('video/')) return Film;
    if (mimetype?.startsWith('audio/')) return Music;
    return File;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate sender number
    if (!selectedSenderNumber) {
      setError('Please enter your WhatsApp sender number');
      return;
    }

    const senderError = validatePhoneNumber(selectedSenderNumber);
    if (senderError) {
      setError(`Sender number: ${senderError}`);
      setSenderNumberError(senderError);
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      // Get connected WhatsApp session
      const sessionsRes = await api.get('/whatsapp/sessions');
      const connectedSession = sessionsRes.data.sessions?.find(s => s.status === 'connected');

      if (!connectedSession) {
        setError('No WhatsApp session connected. Please connect a session first.');
        setSending(false);
        return;
      }

      const sessionId = connectedSession.sessionId;
      const phoneNumber = formData.phone;

      // If file is attached, send media
      if (attachedFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result.split(',')[1]; // Remove data:xxx;base64, prefix

            await api.post('/whatsapp/send-media', {
              sessionId,
              phoneNumber,
              mediaBase64: base64,
              mimetype: attachedFile.type,
              filename: attachedFile.name,
              caption: formData.message || ''
            });

            setResult({ success: true, message: 'Media sent successfully!' });
            handleRemoveFile();
            setFormData({ ...formData, message: '' });
            loadContacts();
          } catch (err) {
            console.error('Send media error:', err);
            setError(err.response?.data?.error || err.message);
          } finally {
            setSending(false);
          }
        };
        reader.readAsDataURL(attachedFile);
        return;
      }

      // Send text message via whatsapp-web.js
      if (formData.messageType === 'text' && formData.message) {
        await api.post('/whatsapp/send', {
          sessionId,
          phoneNumber,
          message: formData.message
        });

        setResult({ success: true, message: 'Message sent successfully!' });

        // Reset form
        setFormData({
          ...formData,
          message: '',
          templateName: '',
          variables: ['', '', '']
        });
        setScheduleEnabled(false);
        setScheduleDate('');
        setScheduleTime('');

        // Reload contacts list
        loadContacts();
      } else if (formData.messageType === 'template') {
        // For templates, use the template content
        const template = templates.find(t => t.name === formData.templateName);
        if (template) {
          let messageContent = template.content;
          formData.variables.forEach((v, i) => {
            messageContent = messageContent.replace(`{{${i + 1}}}`, v || '');
          });

          await api.post('/whatsapp/send', {
            sessionId,
            phoneNumber,
            message: messageContent
          });

          setResult({ success: true, message: 'Template message sent successfully!' });
          setFormData({ ...formData, templateName: '', variables: ['', '', ''] });
          loadContacts();
        }
      }

    } catch (err) {
      console.error('Send message error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const search = searchTerm.toLowerCase();
    return (
      contact.phone?.includes(search) ||
      contact.first_name?.toLowerCase().includes(search) ||
      contact.last_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <Send className="w-6 h-6" />
          Send Individual Message
        </h1>
        <p className="text-gray-400 mt-2">
          Send a WhatsApp message to a contact with their first and last name
        </p>
      </div>

      {/* Display numbers */}
      {(formData.phone || selectedSenderNumber) && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender number */}
            {selectedSenderNumber && (
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white rounded-full p-2">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">
                    SENDER
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {selectedSenderNumber}
                  </div>
                </div>
              </div>
            )}

            {/* Number destinataire */}
            {formData.phone && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">RECIPIENT</div>
                  <div className="text-lg font-bold text-blue-400">{formData.phone}</div>
                  {formData.firstName || formData.lastName ? (
                    <div className="text-xs text-gray-500">
                      {formData.firstName} {formData.lastName}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form main */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Number */}
              <div className={`border rounded-lg p-4 mb-4 ${senderNumberError ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'
                }`}>
                <label className="block text-sm font-medium text-white mb-3">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Your WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={selectedSenderNumber}
                  onChange={(e) => handleSenderNumberChange(e.target.value)}
                  placeholder="+33612345678"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 text-white placeholder-gray-400 ${senderNumberError
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-green-500/50 focus:ring-green-500 focus:border-green-500'
                    }`}
                />
                {senderNumberError ? (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {senderNumberError}
                  </p>
                ) : selectedSenderNumber && !senderNumberError ? (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Valid number format
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    📱 Enter your WhatsApp number in international format (e.g., +33612345678)
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  Recipient Information
                </h2>

                {/* Profile photo */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={avatarPreview}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      size="2xl"
                    />
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar || !formData.phone}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingAvatar ? (
                        <>
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-gray-300">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-300">
                              {avatarPreview ? 'Change Photo' : 'Add Photo'}
                            </div>
                            <div className="text-xs text-gray-500">
                              JPG, PNG, GIF - Max 5MB
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                    {!formData.phone && (
                      <p className="text-xs text-amber-400 mt-2">
                        ⚠️ Please enter phone number first
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+33612345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">International format (E.164)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Country
                    </label>
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="">Auto-detect</option>
                      {countries.map(country => (
                        <option key={country.iso_code} value={country.iso_code}>
                          {country.name} {country.dial_code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Message type */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5" />
                  Message
                </h2>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="radio"
                      value="text"
                      checked={formData.messageType === 'text'}
                      onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>Free text message</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="radio"
                      value="template"
                      checked={formData.messageType === 'template'}
                      onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>Approved template</span>
                  </label>
                </div>

                {formData.messageType === 'text' ? (
                  <div>
                    {/* Free text info */}
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-300 mb-1">✅ Free Message</h4>
                          <p className="text-sm text-green-200">
                            You can send any message to any WhatsApp number.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Your Message *
                    </label>
                    <textarea
                      required={formData.messageType === 'text' && !attachedFile}
                      rows={6}
                      placeholder={`Hello ${formData.firstName || '[First Name]'}, your message here...`}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />

                    {/* File Attachment Section */}
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                          <Paperclip className="w-4 h-4 inline mr-1" />
                          Attach File (optional)
                        </label>
                        <span className="text-xs text-gray-500">Max 16MB</span>
                      </div>

                      <input
                        ref={mediaInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                        className="hidden"
                      />

                      {!attachedFile ? (
                        <button
                          type="button"
                          onClick={() => mediaInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm">Click to attach a file</span>
                            <span className="text-xs">Images, Videos, Audio, PDF, Documents</span>
                          </div>
                        </button>
                      ) : (
                        <div className="border border-gray-600 rounded-lg p-3 bg-gray-700">
                          <div className="flex items-center gap-3">
                            {filePreview && attachedFile.type.startsWith('image/') ? (
                              <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-600 rounded flex items-center justify-center">
                                {(() => {
                                  const IconComponent = getFileIcon(attachedFile.type);
                                  return <IconComponent className="w-8 h-8 text-gray-400" />;
                                })()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-white">{attachedFile.name}</p>
                              <p className="text-xs text-gray-400">
                                {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Blocked file types warning */}
                      <p className="text-xs text-amber-400 mt-2">
                        ⚠️ WhatsApp blocks: .js, .exe, .bat, .apk files. Use .zip to send them.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Info template */}
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-300 mb-1">✅ Message Templates</h4>
                          <p className="text-sm text-green-200">
                            Create and manage your message templates. Use <code className="bg-green-500/30 px-1 rounded">{'{{1}}'}</code>, <code className="bg-green-500/30 px-1 rounded">{'{{2}}'}</code> for variables.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Template *
                        </label>
                        <button
                          type="button"
                          onClick={openNewTemplate}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          New Template
                        </button>
                      </div>

                      {/* Template List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-700">
                        {templates.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">No templates. Create your first one!</p>
                        ) : (
                          templates.map(template => (
                            <div
                              key={template.name}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${formData.templateName === template.name
                                ? 'border-violet-500 bg-violet-500/20'
                                : 'border-gray-600 hover:border-violet-400 hover:bg-gray-600'
                                }`}
                              onClick={() => setFormData({ ...formData, templateName: template.name })}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{template.name}</span>
                                  {template.isDefault && (
                                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">Default</span>
                                  )}
                                  {formData.templateName === template.name && (
                                    <CheckCircle className="w-4 h-4 text-violet-400" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">{template.description}</p>
                                {template.content && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{template.content}</p>
                                )}
                              </div>
                              {!template.isDefault && (
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); openEditTemplate(template); }}
                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.name); }}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {templates.length} template(s) available
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Template Variables
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        First name and last name will be automatically used as variables 1 and 2
                      </p>
                      {[0, 1, 2].map(index => (
                        <input
                          key={index}
                          type="text"
                          placeholder={
                            index === 0 && formData.firstName ? `Auto: ${formData.firstName}` :
                              index === 1 && formData.lastName ? `Auto: ${formData.lastName}` :
                                `Variable ${index + 1}`
                          }
                          value={formData.variables[index]}
                          onChange={(e) => {
                            const newVars = [...formData.variables];
                            newVars[index] = e.target.value;
                            setFormData({ ...formData, variables: newVars });
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 mb-2 text-white placeholder-gray-400"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              {result && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-300">Message sent successfully!</h3>
                      <p className="text-sm text-green-200 mt-1">
                        To: {result.contact.firstName} {result.contact.lastName} ({result.contact.phone})
                      </p>
                      <p className="text-xs text-green-300 mt-1">
                        ID: {result.message.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-300">Error</h3>
                      <p className="text-sm text-red-200 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Option */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <span className="font-medium">Schedule Message</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {scheduleEnabled && (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
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
                          className="w-full px-3 py-2 bg-gray-700 border border-orange-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                          required={scheduleEnabled}
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
                          className="w-full px-3 py-2 bg-gray-700 border border-orange-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                          required={scheduleEnabled}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-orange-300 mt-2">
                      📅 Message will be sent automatically at the scheduled time
                    </p>
                  </div>
                )}
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={sending || (scheduleEnabled && (!scheduleDate || !scheduleTime))}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${scheduleEnabled
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/20 text-white'
                  : 'bg-gradient-to-r from-violet-500 to-cyan-500 hover:shadow-lg hover:shadow-violet-500/20 text-white'
                  } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {scheduleEnabled ? 'Scheduling...' : 'Sending...'}
                  </>
                ) : scheduleEnabled ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    Schedule Message
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Recent Contacts */}
        <div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Recent Contacts</h2>

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400"
            />

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No contacts</p>
              ) : (
                filteredContacts.map(contact => {
                  const avatarUrl = contact.profile_picture
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/single-message/avatar/${contact.profile_picture}`
                    : null;

                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-700 border border-transparent hover:border-violet-500/50 transition-colors flex items-center gap-3"
                    >
                      <Avatar
                        src={avatarUrl}
                        alt={`${contact.first_name || ''} ${contact.last_name || ''}`}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-white">
                          {contact.first_name || contact.last_name ? (
                            `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          ) : (
                            <span className="text-gray-500">No name</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 truncate">{contact.phone}</div>
                        {contact.country_name && (
                          <div className="text-xs text-gray-500 mt-1">
                            {contact.country_name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Create/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 m-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                  setTemplateForm({ name: '', description: '', content: '' });
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="my_template"
                  disabled={!!editingTemplate}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 disabled:bg-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Use lowercase letters and underscores only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Brief description of this template"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Hello {{1}}, welcome to our service! Your code is {{2}}."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use <code className="bg-gray-600 px-1 rounded text-violet-300">{'{{1}}'}</code>, <code className="bg-gray-600 px-1 rounded text-violet-300">{'{{2}}'}</code>, <code className="bg-gray-600 px-1 rounded text-violet-300">{'{{3}}'}</code> for variables
                </p>
              </div>

              {/* Preview */}
              {templateForm.content && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Preview:</p>
                  <p className="text-sm text-gray-200">
                    {templateForm.content
                      .replace('{{1}}', formData.firstName || '[First Name]')
                      .replace('{{2}}', formData.lastName || '[Last Name]')
                      .replace('{{3}}', '[Variable 3]')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                  setTemplateForm({ name: '', description: '', content: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={!templateForm.name || !templateForm.content}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
