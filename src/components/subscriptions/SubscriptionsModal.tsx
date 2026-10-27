import React, { useState } from 'react';
import { SubscriptionPlan, UserProfile } from '../../types/ride';
import { SUBSCRIPTION_PLANS } from '../../data/mockData';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Check,
  Zap,
  GraduationCap,
  Waves,
  Crown,
  Calendar,
} from 'lucide-react';

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubscriptionActivated: (plan: SubscriptionPlan) => void;
}

export const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubscriptionActivated,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentUser.subscription?.planId || 'sub_jeunes');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPlan, setSuccessPlan] = useState<SubscriptionPlan | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);

    try {
      // Save subscription in Firestore
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(
        userRef,
        {
          subscription: {
            planId: plan.id,
            planName: plan.title,
            status: 'ACTIVE',
            expiresAt: '30 Nov 2026',
            discountPct: Math.round(plan.discountRate * 100),
            autoRenew: true,
          },
          isPassJeunes: plan.id === 'sub_jeunes',
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore subscription sync fallback:', err);
    }

    setIsProcessing(false);
    setSuccessPlan(plan);
    onSubscriptionActivated(plan);
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'sub_jeunes':
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'sub_resident':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'sub_kitesurf':
        return <Waves className="w-5 h-5 text-indigo-400" />;
      case 'sub_annual_nomad':
      default:
        return <Crown className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successPlan ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-1.5 pb-3 border-b border-slate-800">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pass Jeunes & Forfaits Résidents</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Abonnements & Réductions Mobilité
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Bénéficiez de 35% à 50% de réduction sur toutes les courses VTC partagées et navettes lagune PK25.
              </p>
            </div>

            {/* Plans List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isCurrent = currentUser.subscription?.planId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                            {getPlanIcon(plan.id)}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {plan.targetAudience}
                            </span>
                            <h3 className="text-xs font-bold text-white">{plan.title}</h3>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                          {plan.badge}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-lg font-black text-white font-mono">{plan.priceMAD} DH</span>
                        <span className="text-[11px] text-slate-400">
                          {plan.period === 'MONTHLY' ? '/mois' : '/an'}
                        </span>
                      </div>

                      {/* Perks */}
                      <ul className="mt-2.5 space-y-1 text-[11px] text-slate-300">
                        {plan.perks.map((perk, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Forfait Actif</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe(plan);
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>Souscrire ({plan.priceMAD} DH)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verification Note for Pass Jeunes */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Vérification de l'âge / Carte Étudiant :</strong>
                <span>
                  Pour le Pass Jeunes (-50%), votre Carte Nationale CIN ou Carte Étudiant est synchronisée via votre dossier KYC pour garantir l'éligibilité.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Abonnement Activé avec Succès !</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Votre forfait <strong>{successPlan.title}</strong> est maintenant actif. La réduction de {Math.round(successPlan.discountRate * 100)}% sera déduite automatiquement lors de vos réservations.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Terminer & Réserver une course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
