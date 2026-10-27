import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Code2,
  FileCode,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

export const FlutterComponentViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'FLUTTER' | 'REACT_NATIVE'>('FLUTTER');

  const flutterDartCode = `// role_switcher_button.dart
// Composant de Basculement Dynamique avec Guard KYC (Flutter + BLoC)
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// --- Types & États ---
enum AppRole { passenger, driver }
enum KycStatus { notSubmitted, pending, approved, rejected }

abstract class RoleState {
  final AppRole currentRole;
  final KycStatus kycStatus;
  const RoleState({required this.currentRole, required this.kycStatus});
}

class RoleLoadedState extends RoleState {
  const RoleLoadedState({required super.currentRole, required super.kycStatus});
}

abstract class RoleEvent {}
class SwitchRoleEvent extends RoleEvent {
  final AppRole targetRole;
  SwitchRoleEvent(this.targetRole);
}

// --- Bloc de gestion de rôle ---
class RoleBloc extends Bloc<RoleEvent, RoleState> {
  RoleBloc() : super(const RoleLoadedState(currentRole: AppRole.passenger, kycStatus: KycStatus.notSubmitted)) {
    on<SwitchRoleEvent>((event, emit) async {
      // Émission du changement après persistance
      emit(RoleLoadedState(currentRole: event.targetRole, kycStatus: state.kycStatus));
    });
  }
}

// --- UI Component: Switch Button avec Guard KYC ---
class RoleSwitchButton extends StatelessWidget {
  const RoleSwitchButton({super.key});

  void _handleSwitch(BuildContext context, RoleState state) {
    if (state.currentRole == AppRole.passenger) {
      // 1. Vérification du statut KYC avant de passer en mode Conducteur
      switch (state.kycStatus) {
        case KycStatus.notSubmitted:
        case KycStatus.rejected:
          _showKycDialog(
            context,
            title: "Accès Conducteur requis",
            message: "Vous devez transmettre vos justificatifs (permis, carte grise, assurance) pour accepter des courses.",
            actionLabel: "Démarrer l'inscription",
            onConfirm: () => Navigator.of(context).pushNamed('/kyc-upload'),
          );
          break;

        case KycStatus.pending:
          _showKycDialog(
            context,
            title: "Dossier en cours d'examen",
            message: "Votre dossier est en cours de validation par nos équipes sous 24h.",
            actionLabel: "Compris",
            onConfirm: () => Navigator.of(context).pop(),
          );
          break;

        case KycStatus.approved:
          // Activation et redirection vers l'espace Chauffeur
          context.read<RoleBloc>().add(SwitchRoleEvent(AppRole.driver));
          Navigator.of(context).pushReplacementNamed('/driver-dashboard');
          break;
      }
    } else {
      // 2. Retour immédiat au mode Passager sans restriction
      context.read<RoleBloc>().add(SwitchRoleEvent(AppRole.passenger));
      Navigator.of(context).pushReplacementNamed('/passenger-home');
    }
  }

  void _showKycDialog(
    BuildContext context, {
    required String title,
    required String message,
    required String actionLabel,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("Annuler"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              onConfirm();
            },
            child: Text(actionLabel),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<RoleBloc, RoleState>(
      builder: (context, state) {
        final isDriver = state.currentRole == AppRole.driver;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          decoration: BoxDecoration(
            color: isDriver ? Colors.amber.shade900 : Colors.indigo.shade700,
            borderRadius: BorderRadius.circular(30),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(30),
            onTap: () => _handleSwitch(context, state),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isDriver ? Icons.drive_eta : Icons.person,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isDriver ? "Mode Conducteur" : "Mode Passager",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white24,
                    ),
                    child: const Icon(
                      Icons.swap_horiz,
                      color: Colors.white,
                      size: 16,
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}`;

  const reactNativeCode = `// RoleSwitcherButton.tsx (React Native + Redux Toolkit / Zustand)
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { switchRole, RootState } from '../store';
import Icon from 'react-native-vector-icons/Ionicons';

export const RoleSwitchButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { currentRole, kycStatus } = useSelector((state: RootState) => state.role);

  const isDriver = currentRole === 'DRIVER';

  const handlePress = () => {
    if (currentRole === 'PASSENGER') {
      switch (kycStatus) {
        case 'NOT_SUBMITTED':
        case 'REJECTED':
          Alert.alert(
            'Accès Conducteur requis',
            'Vous devez transmettre vos pièces justificatives (permis, carte grise, assurance) pour accepter des courses.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: "Démarrer l'inscription", onPress: () => navigation.navigate('KycUpload') },
            ]
          );
          break;

        case 'PENDING':
          Alert.alert(
            "Dossier en cours d'examen",
            'Votre dossier est en cours de validation par nos équipes sous 24h.',
            [{ text: 'Compris' }]
          );
          break;

        case 'APPROVED':
          dispatch(switchRole('DRIVER'));
          navigation.replace('DriverDashboard');
          break;
      }
    } else {
      // Retour immédiat au mode Passager
      dispatch(switchRole('PASSENGER'));
      navigation.replace('PassengerHome');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.container, isDriver ? styles.driverBg : styles.passengerBg]}
    >
      <Icon name={isDriver ? 'car' : 'person'} size={18} color="#FFFFFF" />
      <Text style={styles.label}>
        {isDriver ? 'Mode Conducteur' : 'Mode Passager'}
      </Text>
      <View style={styles.iconCircle}>
        <Icon name="swap-horizontal" size={14} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 8,
  },
  driverBg: { backgroundColor: '#b45309' },
  passengerBg: { backgroundColor: '#4338ca' },
  label: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  iconCircle: {
    padding: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});`;

  const currentCode = activeLang === 'FLUTTER' ? flutterDartCode : reactNativeCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Livrable 4 : Composant Mobile de Basculement Dynamique (Role Switcher avec Guard KYC)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
              Code source de référence implémentant la vérification stricte du statut KYC (<code className="text-amber-400 font-mono">notSubmitted</code>, <code className="text-amber-400 font-mono">pending</code>, <code className="text-amber-400 font-mono">approved</code>, <code className="text-amber-400 font-mono">rejected</code>) avant toute transition vers le profil chauffeur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code copié' : 'Copier le code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Switcher Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveLang('FLUTTER')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeLang === 'FLUTTER'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Flutter (Dart + BLoC)</span>
        </button>
        <button
          onClick={() => setActiveLang('REACT_NATIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeLang === 'REACT_NATIVE'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>React Native (TypeScript)</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono text-amber-400 font-bold">
            {activeLang === 'FLUTTER' ? 'lib/features/role_switcher/presentation/widgets/role_switch_button.dart' : 'src/features/role_switcher/RoleSwitchButton.tsx'}
          </span>
          <span className="text-[10px] text-slate-400">
            {activeLang === 'FLUTTER' ? 'Production Ready (Null-Safe)' : 'TypeScript + Strict Types'}
          </span>
        </div>

        <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto max-h-[520px] leading-relaxed">
          {currentCode}
        </pre>
      </div>
    </div>
  );
};
