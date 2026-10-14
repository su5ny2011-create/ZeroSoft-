import React, { useState } from 'react';
import { 
  Shield, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit, 
  User, 
  Lock, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User as UserType, UserRole } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ZeroSoftLogo } from './ZeroSoftLogo';

export const UsersView: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, changePassword } = useApp();

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [showPassword, setShowPassword] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete Confirm Modal State (التاكيد قبل الحذف)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('manager');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserType) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password);
    setName(u.name);
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        username: username.trim(),
        name: name.trim(),
        role,
      });
      setIsModalOpen(false);
    } else {
      if (!password.trim()) return;
      const success = addUser({
        username: username.trim(),
        password: password.trim(),
        name: name.trim(),
        role,
      });
      if (success) {
        setIsModalOpen(false);
      }
    }
  };

  const openChangePasswordModal = (u: UserType) => {
    setUserForPassword(u);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 3) {
      setPasswordError('كلمة المرور يجب أن تتكون من 3 خانات على الأقل');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (userForPassword) {
      changePassword(userForPassword.id, newPassword);
      setIsPasswordModalOpen(false);
      setUserForPassword(null);
    }
  };

  const handleDeletePrompt = (u: UserType) => {
    setUserToDelete(u);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ZeroSoftLogo size="sm" showText={false} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span>إدارة مستخدمي النظام والصلاحيات</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              إضافة وتعديل مستخدمي برنامج ZeroSoft، تعيين الصلاحيات وتغيير كلمات السر بأمان
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = currentUser?.id === u.id;

          return (
            <div
              key={u.id}
              className={`rounded-3xl bg-slate-900/90 border p-5 shadow-lg flex flex-col justify-between transition ${
                isCurrent ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center font-bold text-base">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{u.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            أنت
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">@{u.username}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : u.role === 'manager'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {u.role === 'admin' ? 'مدير عام (Admin)' : u.role === 'manager' ? 'مشرف / محاسب' : 'مستعرض'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">كلمة المرور الحالية:</span>
                    <span className="font-mono text-slate-400">••••••••</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                    <span>تاريخ الإنشاء:</span>
                    <span className="font-mono">{u.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => openChangePasswordModal(u)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-semibold transition cursor-pointer"
                  title="تغيير كلمة المرور للمستخدم"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تغيير الرمز</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(u)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="تعديل المستخدم"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePrompt(u)}
                    disabled={isCurrent}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                    title={isCurrent ? 'لا يمكن حذف الحساب الحالي' : 'حذف المستخدم'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span>{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</span>
              </h3>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  الاسم الكامل <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  اسم المستخدم (للدخول) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin أو user1"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    كلمة المرور <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 pl-10 text-sm text-white font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">الصلاحية والرتبة</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="admin">مدير النظام (Admin) — صلاحيات كاملة</option>
                  <option value="manager">مشرف / مسؤول رواتب (Manager)</option>
                  <option value="viewer">مستعرض (Viewer) — قراءة فقط</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                >
                  {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal (تغيير رقم السري) */}
      {isPasswordModalOpen && userForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <span>تغيير كلمة المرور للمستخدم</span>
              </h3>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">المستخدم المحدد:</span>
              <span className="font-bold text-cyan-300">{userForPassword.name} (@{userForPassword.username})</span>
            </div>

            {passwordError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  كلمة المرور الجديدة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  تأكيد كلمة المرور الجديدة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور للتأكيد"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Delete (التاكيد قبل الحذف) */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="تأكيد حذف المستخدم"
        message="هل أنت متأكد من رغبتك في حذف هذا المستخدم من النظام؟ لن يتمكن من تسجيل الدخول بعد الآن."
        itemName={userToDelete ? `${userToDelete.name} (@${userToDelete.username})` : ''}
        confirmLabel="نعم، حذف المستخدم"
        cancelLabel="تراجع"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};
