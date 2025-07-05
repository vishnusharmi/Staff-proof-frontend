import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Lock, 
  Mail, 
  Smartphone, 
  Shield, 
  Trash2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { 
  updateSettings, 
  changePassword, 
  updateEmail, 
  fetchConnectedDevices, 
  revokeDevice, 
  enableTwoFactor, 
  disableTwoFactor 
} from '../../../components/api/api';
import { UserContext } from '../../../components/context/UseContext';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [connectedDevices, setConnectedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load user settings and devices
        const [devicesResponse] = await Promise.all([
          fetchConnectedDevices()
        ]);
        
        setConnectedDevices(devicesResponse.data || []);
        setFormData(prev => ({
          ...prev,
          email: user?.email || '',
          twoFactorEnabled: user?.twoFactorEnabled || false
        }));
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updates = {};
      
      // Update email if changed
      if (formData.email !== user?.email) {
        await updateEmail({ email: formData.email });
        updates.email = formData.email;
      }

      // Update password if provided
      if (formData.newPassword) {
        await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }

      // Update two-factor authentication
      if (formData.twoFactorEnabled !== user?.twoFactorEnabled) {
        if (formData.twoFactorEnabled) {
          await enableTwoFactor();
        } else {
          await disableTwoFactor();
        }
        updates.twoFactorEnabled = formData.twoFactorEnabled;
      }

      // Update user context
      if (Object.keys(updates).length > 0) {
        setUser(prev => ({ ...prev, ...updates }));
      }

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast.success('Settings updated successfully!', {
        style: {
          background: '#e0f2f1',
          color: '#00695c',
          boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)'
        }
      });
      
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    try {
      setDevicesLoading(true);
      await revokeDevice(deviceId);
      
      setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
      
      toast.success(`Device revoked successfully`, {
        style: {
          background: '#e0f2f1',
          color: '#00695c',
          boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)'
        }
      });
    } catch (error) {
      console.error('Error revoking device:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke device');
    } finally {
      setDevicesLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 transform transition hover:translate-x-2">
        Account Settings
      </h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Account Settings Section */}
      <div className="bg-white rounded-xl shadow-lg border border-teal-50 p-6 mb-8 
          transition-all hover:shadow-xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
          <Mail className="h-5 w-5 text-teal-600 animate-pulse" />
          Account Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-teal-100 rounded-lg 
                  focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-teal-100 rounded-lg 
                focus:ring-2 focus:ring-teal-500 shadow-sm transition-all"
              placeholder="Required if changing password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-teal-100 rounded-lg 
                focus:ring-2 focus:ring-teal-500 shadow-sm transition-all"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-2.5 border border-teal-100 rounded-lg 
                focus:ring-2 focus:ring-teal-500 shadow-sm transition-all"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center gap-2
              bg-teal-600 text-white rounded-lg hover:bg-teal-700 
              transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Security Settings Section */}
      <div className="bg-white rounded-xl shadow-lg border border-teal-50 p-6 mb-8 
          transition-all hover:shadow-xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-600 animate-bounce" />
          Security Settings
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg
              transition-all hover:bg-teal-100">
            <div>
              <h3 className="font-medium text-gray-700">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-teal-600 
                peer-focus:ring-2 peer-focus:ring-teal-200 transition-all">
                <div className="dot absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full 
                  transition-transform peer-checked:translate-x-5 shadow-md" />
              </div>
            </label>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-4">Connected Devices</h3>
            {devicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-600">Loading devices...</span>
              </div>
            ) : connectedDevices.length > 0 ? (
              <div className="space-y-4">
                {connectedDevices.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-4 
                    border border-teal-100 rounded-lg transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <Smartphone className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="font-medium text-gray-700">{device.name}</p>
                        <p className="text-sm text-gray-500">{device.os} • {device.browser}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Last active {device.lastActive} • {device.location}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 
                        hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No connected devices found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;