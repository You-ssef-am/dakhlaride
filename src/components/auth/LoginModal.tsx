import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/ride';
import { Mail, Phone, X, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, User, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  onOpenPrivacy?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onOpenPrivacy,
}) => {
  const [authMethod, setAuthMethod] = useState<'GOOGLE' | 'PHONE'>('GOOGLE');
  const [customGmail, setCustomGmail] = useState('dakhlaride@gmail.com');
  const [customName, setCustomName] = useState(currentUser.fullName || 'Karim Bennani');
  const [phoneNumber, setPhoneNumber] = useState('+212 6 61 23 45 67');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PASSENGER');

  if (!isOpen) return null;

  const handleGoogleLogin = (emailToUse: string, nameToUse?: string) => {
    onLoginSuccess({
      email: emailToUse,
      fullName: nameToUse || (emailToUse.includes('dakhlaride') ? 'Dakhla Ride Member' : 'Karim Bennani'),
      authProvider: 'GOOGLE',
      currentRole: selectedRole,
    });
    onClose();
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      phoneNumber,
      fullName: customName,
      authProvider: 'PHONE',
      currentRole: selectedRole,
    });
    onClose();
  };

  const quickGoogleAccounts = [
    {
      email: 'dakhlaride@gmail.com',
      name: 'Dakhla Ride (Compte Officiel)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Utilisateur Actuel',
    },
    {
      email: 'yassine.driver.dakhla@gmail.com',
      name: 'Yassine El Amrani (Conducteur Certifié)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Chauffeur Pro',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Connexion & Inscription</h3>
          <p className="text-xs text-slate-400">
            Accédez aux deux modes (Passager et Conducteur) avec votre compte sécurisé
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('GOOGLE');
              setStep('INPUT');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'GOOGLE'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Google / Gmail</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('PHONE')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'PHONE'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>SMS OTP</span>
          </button>
        </div>

        {/* METHOD 1: GOOGLE / GMAIL AUTHENTICATION */}
        {authMethod === 'GOOGLE' && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Comptes Gmail recommandés :
            </span>

            {/* Quick 1-click Google accounts */}
            <div className="space-y-2">
              {quickGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.email, acc.name)}
                  className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{acc.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold border border-slate-700">
                      {acc.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">ou saisir un autre Gmail</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Custom Gmail Form */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Adresse e-mail Google (Gmail)</label>
                <div className="relative">
                  <input
                    type="email"
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="votre.compte@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 pl-9 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nom complet ou Prénom</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 pl-9"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin(customGmail, customName)}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continuer avec ce compte Gmail</span>
              </button>
            </div>
          </div>
        )}

        {/* METHOD 2: SMS OTP AUTHENTICATION */}
        {authMethod === 'PHONE' && (
          <div>
            {step === 'INPUT' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Numéro de téléphone portable</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+212 6 XX XX XX XX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Un code de confirmation par SMS sera envoyé instantanément.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Recevoir le code SMS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Code SMS reçu (4 chiffres)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="9482"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg text-amber-400 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">
                    Code test : 9482
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('INPUT')}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider & Se connecter</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security badge footer & Privacy Notice */}
        <div className="mt-5 pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-500">
          <p className="text-center text-[10px] text-slate-400">
            En continuant, vous acceptez nos conditions et notre{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrivacy?.();
              }}
              className="text-amber-400 hover:text-amber-300 underline font-semibold"
            >
              Politique de Confidentialité (Loi 09-08 / CNDP)
            </button>
            .
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentification chiffrée SSL / OAuth 2.0</span>
            </div>
            <span>Dakhla, Maroc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
