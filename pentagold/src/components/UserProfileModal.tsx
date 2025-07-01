import React, { useEffect, useState, ChangeEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { getUserProfile, updateUserProfile, createUserProfile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId, email }) => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!userId) return null;

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserProfile(userId)
        .then(profile => {
          if (!profile) {
            // Nếu chưa có profile, tạo mới
            createUserProfile(userId, { full_name: '', avatar_url: '' });
          }
          setFullName(profile?.full_name || '');
          setAvatarUrl(profile?.avatar_url || '');
        })
        .catch(() => {
          setFullName('');
          setAvatarUrl('');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return avatarUrl;
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
    if (error) throw error;
    const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName).data;
    return publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }
      await updateUserProfile(userId, { full_name: fullName, avatar_url: newAvatarUrl });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError('Cập nhật hồ sơ thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    try {
      // Đăng nhập lại để xác thực mật khẩu cũ
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: oldPassword });
      if (signInError) {
        setPasswordError('Mật khẩu cũ không đúng.');
        return;
      }
      // Đổi mật khẩu
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError('Đổi mật khẩu thất bại.');
        return;
      }
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2000);
    } catch (err) {
      setPasswordError('Có lỗi xảy ra.');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      <Dialog.Panel className="relative bg-[#181b24] rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
        <Dialog.Title className="text-2xl font-bold text-white mb-4">Chỉnh sửa hồ sơ</Dialog.Title>
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            <img
              src={avatarUrl || '/default-avatar.png'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 bg-gray-700"
            />
            <label className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-1 cursor-pointer hover:bg-amber-600 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <span className="text-xs">Đổi</span>
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-400 border border-gray-600 mb-2 cursor-not-allowed"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-1">Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-500 focus:ring-amber-500"
            placeholder="Nhập họ tên của bạn"
          />
        </div>
        {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
        {success && <div className="text-green-500 mb-3 text-sm">Cập nhật thành công!</div>}
        <div className="mb-8">
          <button
            className="text-amber-400 hover:underline text-sm font-medium mb-2"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            type="button"
          >
            {showPasswordForm ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}
          </button>
          {showPasswordForm && (
            <div className="bg-gray-800 rounded-xl p-4 mt-2">
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Mật khẩu cũ</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-300 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              {passwordError && <div className="text-red-500 mb-2 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-500 mb-2 text-sm">Đổi mật khẩu thành công!</div>}
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors mt-2"
                type="button"
              >
                Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
            disabled={loading}
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default UserProfileModal; 