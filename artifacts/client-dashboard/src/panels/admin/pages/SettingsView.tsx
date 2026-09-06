import React, { useState, useEffect } from 'react';
import { UserPlus, X, Edit2, Trash2, CheckCircle2, Shield, Mail, User, AlertCircle } from 'lucide-react';

export interface AdminUser {
  id: string;
  name: string;
  role: 'Super Admin' | 'Finance Admin' | 'Operations Admin' | 'Clinical Admin' | 'Support Admin';
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
}

const INITIAL_ADMINS: AdminUser[] = [
  { id: 'ADM-1', name: 'Dr. Alex Harrison', role: 'Super Admin', email: 'alex.admin@hexpertify.com', status: 'Active', createdAt: '2025-01-15' },
  { id: 'ADM-2', name: 'Finance Manager', role: 'Finance Admin', email: 'finance@hexpertify.com', status: 'Active', createdAt: '2025-02-01' },
  { id: 'ADM-3', name: 'Ops Team Lead', role: 'Operations Admin', email: 'ops@hexpertify.com', status: 'Active', createdAt: '2025-03-10' }
];

export const SettingsView: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('hexpertify_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: AdminUser['role'];
    status: AdminUser['status'];
  }>({
    name: '',
    email: '',
    role: 'Super Admin',
    status: 'Active'
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    localStorage.setItem('hexpertify_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      role: 'Super Admin',
      status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove admin user "${name}"?`)) {
      setAdminUsers((prev) => prev.filter((usr) => usr.id !== id));
      showToast(`Admin user "${name}" removed successfully.`);
    }
  };

  const handleToggleStatus = (id: string) => {
    setAdminUsers((prev) =>
      prev.map((usr) => {
        if (usr.id === id) {
          const nextStatus: AdminUser['status'] = usr.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`Status updated to ${nextStatus} for ${usr.name}.`);
          return { ...usr, status: nextStatus };
        }
        return usr;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingAdmin) {
      // Update existing admin
      setAdminUsers((prev) =>
        prev.map((usr) =>
          usr.id === editingAdmin.id
            ? {
                ...usr,
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
                status: formData.status
              }
            : usr
        )
      );
      showToast(`Admin user "${formData.name.trim()}" updated successfully.`);
    } else {
      // Add new admin
      const newAdmin: AdminUser = {
        id: `ADM-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdminUsers((prev) => [newAdmin, ...prev]);
      showToast(`New admin user "${newAdmin.name}" added successfully.`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-[28px] bg-gradient-to-r from-[#4f28d9] via-[#5e2be2] to-[#3b1799] p-8 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase text-purple-200 border border-white/20">
            Platform Configuration
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-3">Admin Settings & RBAC Control</h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            Manage admin credentials, role permissions, and access privileges.
          </p>
        </div>
      </div>

      {/* Admin Team & Roles Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Admin Users & Permissions</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {adminUsers.length} authorized administrative account{adminUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-[#5e2be2]/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin User
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {adminUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No admin users found. Click <strong className="text-slate-700">Add Admin User</strong> to create one.
            </div>
          ) : (
            adminUsers.map((usr) => (
              <div key={usr.id} className="py-4 flex items-center justify-between flex-wrap gap-4 hover:bg-slate-50/50 px-3 rounded-2xl transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-[#5e2be2] flex items-center justify-center font-extrabold text-sm border border-purple-200/50 shadow-xs">
                    {usr.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {usr.name}
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                        {usr.id}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {usr.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-50 text-[#5e2be2] font-bold text-xs rounded-full border border-purple-100/60 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {usr.role}
                  </span>
                  
                  <button
                    onClick={() => handleToggleStatus(usr.id)}
                    title="Click to toggle status"
                    className={`px-3 py-1 font-bold text-xs rounded-full transition-all cursor-pointer ${
                      usr.status === 'Active'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        : usr.status === 'Pending'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {usr.status}
                  </button>

                  <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => handleOpenEditModal(usr)}
                      title="Edit Admin"
                      className="p-2 text-slate-400 hover:text-[#5e2be2] hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(usr.id, usr.name)}
                      title="Delete Admin"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add/Edit Admin User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5e2be2] text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure credentials & RBAC access role</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#5e2be2]'
                    } rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="e.g. priya.sharma@hexpertify.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-[#5e2be2]'
                    } rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Admin Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as AdminUser['role'] }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Operations Admin">Operations Admin</option>
                    <option value="Clinical Admin">Clinical Admin</option>
                    <option value="Support Admin">Support Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as AdminUser['status'] }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5e2be2]"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5e2be2] hover:bg-[#4f28d9] text-white font-bold text-xs rounded-xl shadow-md shadow-[#5e2be2]/20 transition-all cursor-pointer"
                >
                  {editingAdmin ? 'Save Changes' : 'Create Admin User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
