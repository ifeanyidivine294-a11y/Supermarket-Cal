import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfficeRole } from '../types';
import { UserCheck, Shield, Phone, User, Briefcase, Camera } from 'lucide-react';

const OFFICE_ROLES: OfficeRole[] = [
  'Cashier',
  'Sales Representative',
  'Shop Attendant',
  'Storekeeper',
  'Sales Supervisor',
  'Other',
];

export const ProfileCompletionModal: React.FC = () => {
  const { profile, saveUserProfile, needsProfileCompletion } = useApp();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [officeRole, setOfficeRole] = useState<OfficeRole | string>(
    profile?.officeRole || 'Cashier'
  );
  const [customRole, setCustomRole] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!needsProfileCompletion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return alert('Please enter your full legal name');

    const finalRole = officeRole === 'Other' && customRole.trim() ? customRole.trim() : officeRole;
    if (!finalRole) return alert('Please select your official office role');

    setIsSubmitting(true);
    try {
      await saveUserProfile({
        fullName: fullName.trim(),
        officeRole: finalRole,
        phone: phone.trim(),
        photoURL: photoURL.trim(),
      });
    } catch (err) {
      console.error(err);
      alert('Could not save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#12A84A] mx-auto flex items-center justify-center mb-2.5 shadow-sm">
            <UserCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-[#071B3A]">Staff Profile Verification</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to Trusted SupermarketCal. Please complete your employee credentials to access the sales register.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adaeze Okafor"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
              />
            </div>
          </div>

          {/* Email (Auto-filled from Google) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Staff Email Address
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || 'authenticated-staff@supermarket.com'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Verified through your Google login session
            </span>
          </div>

          {/* Office Role / Position */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Office Role / Job Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                required
                value={officeRole}
                onChange={(e) => setOfficeRole(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#12A84A] focus:outline-none bg-white"
              >
                {OFFICE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {officeRole === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specify Role Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Inventory Clerk"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
              />
            </div>
          )}

          {/* Phone Number (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0801 234 5678"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#12A84A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#12A84A] hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Verifying & Saving...' : 'Complete Profile & Open Register'}
          </button>
        </form>
      </div>
    </div>
  );
};
