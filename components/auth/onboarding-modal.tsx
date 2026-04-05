'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/db';

// =========================================================
// INDIAN PHONE NUMBER VALIDATION — STRONG FAKE DETECTION
// =========================================================
const FAKE_EXACT: Set<string> = new Set([
  '1234567890', '0123456789', '9876543210', '9999999999',
  '1122334455', '1231231230', '9898989898', '7777777777',
  '8888888888', '6666666666', '0000000000', '1234512345',
  '1234567891', '9999988888', '1111122222', '9090909090',
  '0987654321', '1230000000', '9999000000', '1234000000',
  '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6789012345', '5432167890', '9123456789',
]);

function validateIndianMobile(num: string): { valid: boolean; reason?: string } {
  const clean = num.replace(/\D/g, '');

  if (clean.length < 10) return { valid: false, reason: 'Please enter 10 digits' };
  if (clean.length > 10) return { valid: false, reason: 'Number cannot exceed 10 digits' };

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(clean)) {
    return { valid: false, reason: 'Indian mobile must start with 6, 7, 8 or 9' };
  }

  // Exact fake number match
  if (FAKE_EXACT.has(clean)) {
    return { valid: false, reason: '⛔ Fake number detected — use your real number' };
  }

  // All same digits: 9999999999, 7777777777
  if (/^(\d)\1{9}$/.test(clean)) {
    return { valid: false, reason: '⛔ Fake number detected — use your real number' };
  }

  // First 5 = last 5: 9898989898
  if (clean.slice(0, 5) === clean.slice(5)) {
    return { valid: false, reason: '⛔ Repeating pattern detected — use your real number' };
  }

  // 6+ sequential ascending digits anywhere: 123456, 567890
  const seqAsc = '0123456789';
  const seqDesc = '9876543210';
  for (let i = 0; i <= clean.length - 6; i++) {
    const slice = clean.slice(i, i + 6);
    if (seqAsc.includes(slice) || seqDesc.includes(slice)) {
      return { valid: false, reason: '⛔ Sequential digits detected — use your real number' };
    }
  }

  // 4+ repeated digits in a row: 9999, 0000
  if (/(\d)\1{3}/.test(clean)) {
    return { valid: false, reason: '⛔ Too many repeated digits — use your real number' };
  }

  return { valid: true };
}

// =========================================================
// CATEGORIES
// =========================================================
const CATEGORIES = [
  { id: 'student',        label: 'Student',        emoji: '🎓', desc: 'Student accommodation' },
  { id: 'job',            label: 'Working Pro',     emoji: '💼', desc: 'Working professional' },
  { id: 'property_owner', label: 'Property Owner',  emoji: '🏠', desc: 'Want to list my property' },
];

type Step = 'name' | 'phone' | 'otp' | 'done';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  const [step, setStep] = useState<Step>('name');
  const [name] = useState(userName);
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsContact, setSameAsContact] = useState(false);
  const [category, setCategory] = useState('');

  const [contactError, setContactError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [contactShake, setContactShake] = useState(false);
  const [whatsappShake, setWhatsappShake] = useState(false);

  const [otpProgress, setOtpProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // When "same as contact" toggled
  useEffect(() => {
    if (sameAsContact) {
      setWhatsappNumber(contactNumber);
      setWhatsappError('');
    }
  }, [sameAsContact, contactNumber]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!isOpen) return null;

  const triggerShake = (field: 'contact' | 'whatsapp') => {
    if (field === 'contact') {
      setContactShake(true);
      setTimeout(() => setContactShake(false), 600);
    } else {
      setWhatsappShake(true);
      setTimeout(() => setWhatsappShake(false), 600);
    }
  };

  // ── STEP 2: Validate & trigger OTP animation
  const handlePhoneValidate = () => {
    let ok = true;

    const contactCheck = validateIndianMobile(contactNumber);
    if (!contactCheck.valid) {
      setContactError(contactCheck.reason || 'Invalid number');
      triggerShake('contact');
      ok = false;
    } else {
      setContactError('');
    }

    const waNumber = sameAsContact ? contactNumber : whatsappNumber;
    const waCheck = validateIndianMobile(waNumber);
    if (!waCheck.valid) {
      setWhatsappError(waCheck.reason || 'Invalid WhatsApp number');
      triggerShake('whatsapp');
      ok = false;
    } else {
      setWhatsappError('');
    }

    if (!category) { ok = false; }

    if (ok) {
      handleGenerateOtp();
    }
  };

  // ── STEP 3: Fake OTP animation → auto submit
  const handleGenerateOtp = () => {
    setStep('otp');
    setOtpProgress(0);

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 2;
      setOtpProgress(progress);
      if (progress >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleSave();
      }
    }, 100); // 50 steps × 100ms = 5 seconds
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const finalWhatsapp = sameAsContact ? contactNumber : whatsappNumber;
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id, // Explicitly provide ID for upsert
        full_name: name.trim(),
        contact_number: contactNumber.replace(/\D/g, ''),
        whatsapp_number: finalWhatsapp.replace(/\D/g, ''),
        profession: category,
        category: category, // Syncing both columns
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (error) throw error;

      localStorage.setItem('nbf_onboarding_v2_done', 'true');
      setStep('done');
      setTimeout(() => { onComplete(); }, 1400);
    } catch (e: any) {
      console.error('Onboarding save error:', e);
      // In a real app we would use a toast here
      alert('Error saving your profile: ' + (e.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Real-time validation on input blur (light check)
  const handleContactBlur = () => {
    if (contactNumber.length > 0) {
      const r = validateIndianMobile(contactNumber);
      if (!r.valid) { setContactError(r.reason || 'Invalid'); triggerShake('contact'); }
      else setContactError('');
    }
  };

  const handleWhatsappBlur = () => {
    if (whatsappNumber.length > 0 && !sameAsContact) {
      const r = validateIndianMobile(whatsappNumber);
      if (!r.valid) { setWhatsappError(r.reason || 'Invalid'); triggerShake('whatsapp'); }
      else setWhatsappError('');
    }
  };

  const isPhoneStepReady = contactNumber.length === 10 && (sameAsContact || whatsappNumber.length === 10) && !!category;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex items-center gap-1.5 px-6 pt-4">
            {(['name', 'phone', 'otp'] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                  ${step === s ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                  {idx + 1}
                </div>
                {idx < 2 && <div className={`h-0.5 w-8 rounded transition-all ${step !== 'name' && idx === 0 ? 'bg-black' : step === 'otp' && idx === 1 ? 'bg-black' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">

            {/* ── STEP: NAME ── */}
            {step === 'name' && (
              <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">Welcome to NBF Homes! 👋</h2>
                  <p className="text-sm text-neutral-500 mt-1">Let's confirm your profile before we continue.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">Your Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        readOnly
                        className="w-full px-4 py-3 pr-10 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 font-medium text-sm cursor-not-allowed focus:outline-none"
                        placeholder="Your name"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      Fetched from your Google account — cannot be changed
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('phone')}
                    disabled={name.trim().length < 2}
                    className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: PHONE ── */}
            {step === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">Your Contact Details</h2>
                  <p className="text-sm text-neutral-500 mt-1">Enter your real numbers — property owners will contact you directly.</p>
                </div>


                <div className="space-y-4">
                  {/* Contact Number */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5 block">
                      📱 Enter Your Contact Number
                    </label>
                    <motion.div
                      animate={contactShake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="flex"
                    >
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={contactNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setContactNumber(val);
                          setContactError('');
                          if (sameAsContact) setWhatsappNumber(val);
                        }}
                        onBlur={handleContactBlur}
                        placeholder="9876543210"
                        className={`flex-1 px-4 py-3 rounded-r-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all
                          ${contactError ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-neutral-200 focus:ring-blue-200 bg-white'}`}
                      />
                    </motion.div>
                    {contactError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                        ⚠️ {contactError}
                      </p>
                    )}
                    {!contactError && contactNumber.length === 10 && (
                      <p className="text-green-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                        ✅ Looks good!
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                        💬 Enter Your WhatsApp Number
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsContact}
                          onChange={(e) => setSameAsContact(e.target.checked)}
                          className="w-3.5 h-3.5 accent-green-600 cursor-pointer"
                        />
                        <span className="text-[11px] text-neutral-500">Same as above</span>
                      </label>
                    </div>
                    <motion.div
                      animate={whatsappShake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="flex"
                    >
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-500 text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={whatsappNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setWhatsappNumber(val);
                          setWhatsappError('');
                          if (sameAsContact) setSameAsContact(false);
                        }}
                        onBlur={handleWhatsappBlur}
                        disabled={sameAsContact}
                        placeholder="9876543210"
                        className={`flex-1 px-4 py-3 rounded-r-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all
                          ${sameAsContact ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
                            : whatsappError ? 'border-red-400 focus:ring-red-200 bg-red-50'
                            : 'border-neutral-200 focus:ring-green-200 bg-white'}`}
                      />
                    </motion.div>
                    {whatsappError && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                        ⚠️ {whatsappError}
                      </p>
                    )}
                    {!whatsappError && (sameAsContact ? contactNumber.length === 10 : whatsappNumber.length === 10) && (
                      <p className="text-green-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                        ✅ Looks good!
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2 block">
                      🎯 I Am A...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            category === cat.id
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          <span className="text-xl mb-1">{cat.emoji}</span>
                          <span className="text-xs font-bold">{cat.label}</span>
                          <span className={`text-[10px] mt-0.5 ${category === cat.id ? 'text-neutral-300' : 'text-neutral-400'}`}>{cat.desc}</span>
                        </button>
                      ))}
                    </div>
                    {!category && (
                      <p className="text-[11px] text-neutral-400 mt-1.5 text-center">Please select your category above</p>
                    )}
                  </div>

                  {/* Generate OTP Button */}
                  <button
                    onClick={handlePhoneValidate}
                    disabled={!isPhoneStepReady}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 mt-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Generate OTP &amp; Verify
                  </button>

                  <p className="text-[11px] text-center text-neutral-400">
                    🔒 Your numbers are private and only used for property alerts
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP: OTP (Fake Animation) ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="py-4">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative w-20 h-20">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                      {otpProgress < 100 ? (
                        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      )}
                    </div>
                    {/* Circular progress */}
                    <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle
                        cx="40" cy="40" r="36" fill="none"
                        stroke="#22c55e" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - otpProgress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-100"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {otpProgress < 100 ? 'Verifying Your Numbers...' : 'Verified! ✅'}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      {otpProgress < 100
                        ? 'Please wait while we securely verify your contact details'
                        : 'Your profile is being saved...'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      style={{ width: `${otpProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full mt-2">
                    {[
                      { label: 'Contact', value: contactNumber.length >= 4 ? `+91 ${contactNumber.slice(0, 2)}****${contactNumber.slice(-2)}` : '—' },
                      { label: 'WhatsApp', value: (() => { const wa = sameAsContact ? contactNumber : whatsappNumber; return wa.length >= 4 ? `+91 ${wa.slice(0, 2)}****${wa.slice(-2)}` : '—'; })() },
                      { label: 'Category', value: (CATEGORIES.find(c => c.id === category)?.emoji || '') + ' ' + (CATEGORIES.find(c => c.id === category)?.label || '') },
                    ].map((item) => (
                      <div key={item.label} className="bg-neutral-50 rounded-xl p-2.5 text-center border border-neutral-100">
                        <p className="text-[10px] text-neutral-400 font-medium">{item.label}</p>
                        <p className="text-[11px] font-bold text-neutral-900 mt-0.5 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP: DONE ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-neutral-900">You're All Set! 🎉</h2>
                <p className="text-sm text-neutral-500 mt-1">Welcome to NBF Homes, {name.split(' ')[0]}!</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
