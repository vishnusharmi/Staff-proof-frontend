import React, { useState } from 'react';
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

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    email: 'manishraj@example.com',
    currentPassword: '',
    newPassword: '',
    twoFactorEnabled: false
  });

  const [connectedDevices] = useState([
    {
      id: 1,
      name: 'Windows Desktop',
      os: 'Windows 10',
      browser: 'Chrome 115',
      lastActive: '2 hours ago',
      location: 'Kolkata, India'
    },
    {
      id: 2,
      name: 'Android Phone',
      os: 'Android 13',
      browser: 'Firefox Mobile',
      lastActive: '1 week ago',
      location: 'Mumbai, India'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully!', {
        style: {
          background: '#e0f2f1',
          color: '#00695c',
          boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)'
        }
      });
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const revokeDevice = (deviceId) => {
    toast.success(`Device ${deviceId} revoked successfully`, {
      style: {
        background: '#e0f2f1',
        color: '#00695c',
        boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)'
      }
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 transform transition hover:translate-x-2">
        Account Settings
      </h1>
      
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
              />
              <button
                type="button"
                className="px-4 py-2.5 bg-teal-100 text-teal-700 rounded-lg
                  hover:bg-teal-200 transition-colors shadow-md hover:shadow-lg"
              >
                Change Email
              </button>
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
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center gap-2
              bg-teal-600 text-white rounded-lg hover:bg-teal-700 
              transition-all shadow-md hover:shadow-lg"
          >
            <CheckCircle className="h-5 w-5 animate-spin-once" />
            Save Changes
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
                    onClick={() => revokeDevice(device.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1.5
                      transition-all hover:scale-105"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Revoke</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 
          transition-all hover:shadow-lg">
        <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-white 
              border border-red-200 rounded-lg hover:border-red-300 transition-all
              hover:shadow-md">
            <div>
              <p className="text-red-700 font-medium">Delete Account</p>
              <p className="text-sm text-red-500">Permanently remove your account and all data</p>
            </div>
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-white 
              border border-red-200 rounded-lg hover:border-red-300 transition-all
              hover:shadow-md">
            <div>
              <p className="text-red-700 font-medium">Reset All Settings</p>
              <p className="text-sm text-red-500">Restore all settings to default values</p>
            </div>
            <RefreshCw className="h-5 w-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;