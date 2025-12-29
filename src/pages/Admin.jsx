import { useState, useEffect } from 'react';
import { Users, Plus, Settings, Shield, Check, X, Trash2, Eye, EyeOff, UserCheck, UserX, Clock, RefreshCw, Edit2, Key } from 'lucide-react';
import api from '../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', slug: '', email: '', password: '', plan: 'starter' });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [orgsRes, statsRes, usersRes, pendingRes] = await Promise.all([
        api.get('/admin/organizations'),
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/users/pending')
      ]);
      setOrganizations(orgsRes.data);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/pending')
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const approveUser = async (userId, maxSessions = 5, role = 'user') => {
    try {
      await api.put(`/admin/users/${userId}/approve`, { maxWhatsappSessions: maxSessions, role });
      loadUsers();
      loadData();
      alert('User approved!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectUser = async (userId) => {
    if (!confirm('Reject this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/reject`);
      loadUsers();
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const suspendUser = async (userId) => {
    if (!confirm('Suspend this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const reactivateUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/reactivate`);
      loadUsers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Delete "${userName}"?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadUsers();
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateUserSettings = async (userId, settings) => {
    try {
      await api.put(`/admin/users/${userId}`, settings);
      loadUsers();
      setShowUserModal(false);
      alert('User updated!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateUserPassword = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put(`/admin/users/${userId}/password`, { password: newPassword });
      setShowPasswordModal(false);
      setPasswordUser(null);
      setNewPassword('');
      alert('Password updated successfully!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSavingPassword(false);
    }
  };

  const loadOrgDetails = async (orgId) => {
    try {
      const response = await api.get(`/admin/organizations/${orgId}`);
      setSelectedOrg(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFeature = async (orgId, featureId, enabled) => {
    try {
      await api.post(`/admin/organizations/${orgId}/features`, { featureId, enabled });
      loadOrgDetails(orgId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleOrgStatus = async (orgId, active) => {
    try {
      await api.put(`/admin/organizations/${orgId}`, { active: active ? 1 : 0 });
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post('/admin/organizations', newClient);
      setNewClient({ name: '', slug: '', email: '', password: '', plan: 'starter' });
      setShowCreateModal(false);
      loadData();
      const creds = response.data.defaultCredentials;
      alert(`Client created!\nEmail: ${creds.email}\nPassword: ${creds.password}`);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClient = async (orgId, orgName) => {
    if (!confirm(`Delete "${orgName}"?`)) return;
    try {
      await api.delete(`/admin/organizations/${orgId}`);
      loadData();
      if (selectedOrg?.id === orgId) setSelectedOrg(null);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
            <Shield className="w-8 h-8 text-white" />
          </div>
          Administration
        </h1>
        <p className="text-gray-400 mt-2">Manage users and organizations</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{stats.totalAgents}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{stats.pendingAgents || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all">
            <p className="text-gray-400 text-sm">Organizations</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{stats.totalOrganizations - 1}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all">
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stats.activeOrganizations - 1}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'users'
            ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
            : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-violet-500/50'
            }`}
        >
          <UserCheck className="w-5 h-5" />
          Users {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{pendingUsers.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'organizations'
            ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
            : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-violet-500/50'
            }`}
        >
          <Users className="w-5 h-5" />
          Organizations
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Approvals */}
          {pendingUsers.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals ({pendingUsers.length})
              </h2>
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div key={user.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="text-xs text-gray-500">Registered: {new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUser({ ...user, maxSessions: 5, newRole: 'user' }); setShowUserModal(true); }} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-green-500/20 transition-all">
                        <UserCheck className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => rejectUser(user.id)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-red-500/20 transition-all">
                        <UserX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Users Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" /> All Users
              </h2>
              <div className="flex items-center gap-2">
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button onClick={loadUsers} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"><RefreshCw className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Role</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Sessions</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => userFilter === 'all' || u.status === userFilter).map(user => (
                    <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">{user.max_whatsapp_sessions || 1}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'approved' ? 'bg-green-500/20 text-green-400' : user.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : user.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                          {user.status || 'approved'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {user.role !== 'super_admin' && (
                            <>
                              <button onClick={() => { setPasswordUser(user); setNewPassword(''); setShowPasswordModal(true); }} className="p-1.5 bg-violet-500/20 text-violet-400 rounded hover:bg-violet-500/30 transition-colors" title="Change Password"><Key className="w-4 h-4" /></button>
                              <button onClick={() => { setSelectedUser({ ...user, maxSessions: user.max_whatsapp_sessions || 1, newRole: user.role, editMode: true }); setShowUserModal(true); }} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                              {user.status === 'approved' && <button onClick={() => suspendUser(user.id)} className="p-1.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors" title="Suspend"><X className="w-4 h-4" /></button>}
                              {user.status === 'suspended' && <button onClick={() => reactivateUser(user.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors" title="Reactivate"><RefreshCw className="w-4 h-4" /></button>}
                              <button onClick={() => deleteUser(user.id, user.name)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Users className="w-5 h-5 text-violet-400" /> Organizations</h2>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/20 transition-all">
                  <Plus className="w-4 h-4" /> New Client
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.filter(org => org.id !== 1).map(org => (
                      <tr key={org.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{org.name}</div>
                          <div className="text-xs text-gray-500">{org.slug}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${org.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' : org.plan === 'professional' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                            {org.plan?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {org.active ? <span className="text-green-400 flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Active</span> : <span className="text-red-400 flex items-center justify-center gap-1"><X className="w-4 h-4" /> Inactive</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => loadOrgDetails(org.id)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"><Settings className="w-4 h-4" /></button>
                            <button onClick={() => toggleOrgStatus(org.id, !org.active)} className={`p-1.5 rounded transition-colors ${org.active ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>{org.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}</button>
                            <button onClick={() => handleDeleteClient(org.id, org.name)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Organization Details Panel */}
          <div>
            {selectedOrg ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">{selectedOrg.name}</h3>
                  <p className="text-sm text-gray-400">{selectedOrg.email}</p>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-medium text-white">Active</span>
                      <input type="checkbox" checked={selectedOrg.active} onChange={(e) => toggleOrgStatus(selectedOrg.id, e.target.checked)} className="w-5 h-5 accent-violet-500" />
                    </label>
                  </div>
                  <h4 className="font-semibold mb-4 text-white">Features</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedOrg.features?.map(feature => (
                      <label key={feature.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-white">{feature.name}</div>
                          <div className="text-xs text-gray-400">{feature.description}</div>
                        </div>
                        <input type="checkbox" checked={feature.enabled === 1} onChange={(e) => toggleFeature(selectedOrg.id, feature.id, e.target.checked)} className="ml-3 accent-violet-500" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Select an organization</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="bg-gradient-to-r from-violet-500 to-cyan-500 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="w-6 h-6" /> New Client</h3>
            </div>
            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name *</label>
                <input type="text" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-400" placeholder="Company Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                <input type="text" required value={newClient.slug} onChange={(e) => setNewClient({ ...newClient, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-400" placeholder="company-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-400" placeholder="contact@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-400" placeholder="Min 6 characters" minLength="6" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan *</label>
                <select required value={newClient.plan} onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white">
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors" disabled={creating}>Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {creating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Check className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className={`p-6 rounded-t-2xl ${selectedUser.editMode ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedUser.editMode ? <Edit2 className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                {selectedUser.editMode ? 'Edit User' : 'Approve User'}
              </h3>
              <p className="text-white/80 text-sm mt-1">{selectedUser.name} ({selectedUser.email})</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select value={selectedUser.newRole} onChange={(e) => setSelectedUser({ ...selectedUser, newRole: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max WhatsApp Sessions</label>
                <input type="number" min="1" max="20" value={selectedUser.maxSessions} onChange={(e) => setSelectedUser({ ...selectedUser, maxSessions: parseInt(e.target.value) || 1 })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white" />
                <p className="text-xs text-gray-500 mt-1">1-20 sessions allowed</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowUserModal(false); setSelectedUser(null); }} className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={() => { if (selectedUser.editMode) { updateUserSettings(selectedUser.id, { role: selectedUser.newRole, maxWhatsappSessions: selectedUser.maxSessions }); } else { approveUser(selectedUser.id, selectedUser.maxSessions, selectedUser.newRole); setShowUserModal(false); setSelectedUser(null); } }} className={`flex-1 px-4 py-2 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${selectedUser.editMode ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/20'}`}>
                  <Check className="w-4 h-4" />
                  {selectedUser.editMode ? 'Save' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6" />
                Change Password
              </h3>
              <p className="text-white/80 text-sm mt-1">{passwordUser.name} ({passwordUser.email})</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3">
                <p className="text-violet-300 text-sm">
                  <strong>Note:</strong> Passwords are securely hashed and cannot be viewed. You can only set a new password here.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-400"
                    placeholder="Min 6 characters"
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowPasswordModal(false); setPasswordUser(null); setNewPassword(''); }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUserPassword(passwordUser.id)}
                  disabled={savingPassword || newPassword.length < 6}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {savingPassword ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Check className="w-4 h-4" />}
                  {savingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
