import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, ShieldCheck, User, Sparkles, MapPin } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginAsDemoUser, isAuthLoading } = useApp();

  return (
    <div className="min-h-screen bg-[#071B3A] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#12A84A] to-[#0B662C] flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white leading-tight">
              Trusted <span className="text-[#12A84A]">SupermarketCal</span>
            </div>
            <div className="text-[10px] text-slate-400">Shop Smart. Pay Less.</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-[#0F284E] px-3 py-1.5 rounded-full border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Asaba, Delta State, Nigeria</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="my-auto max-w-md w-full mx-auto bg-[#0A2246] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#12A84A] text-white mx-auto flex items-center justify-center mb-3 shadow-xl shadow-emerald-900/50">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sign In to Trusted SupermarketCal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Supermarket POS, Multi-Tier Sales Calculator & Real-Time Monitoring
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isAuthLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Logins for instant evaluation without popup blockers */}
          <div className="pt-4 border-t border-slate-700/60">
            <div className="text-center text-[11px] text-slate-400 font-semibold mb-2.5">
              OR TEST DIRECTLY WITH PRESET ROLES:
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => loginAsDemoUser('admin')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#0F284E] hover:bg-[#153464] border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-left">
                    <div className="leading-tight">Enter as Supermarket Owner (Admin)</div>
                    <div className="text-[10px] text-slate-400 font-mono">chukwudebeifeanyi6@gmail.com</div>
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Full Access
                </span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoUser('salesperson')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#0F284E] hover:bg-[#153464] border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-left">
                    <div className="leading-tight">Enter as Salesperson (Cashier)</div>
                    <div className="text-[10px] text-slate-400">Adaeze Okafor · Cashier</div>
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  Sales Only
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-[10px] text-slate-400 leading-normal">
          Authorized owner email: <span className="text-emerald-400 font-mono">chukwudebeifeanyi6@gmail.com</span>
          <br />
          All other staff accounts are routed to the Sales Person Portal.
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-2">
        Trusted SupermarketCal · Asaba, Delta State, Nigeria · Powered by Firebase Firestore & Auth
      </div>
    </div>
  );
};
