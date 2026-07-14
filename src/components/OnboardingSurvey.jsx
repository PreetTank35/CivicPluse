import { useState, useEffect } from 'react';
import {
  Sparkles, MapPin, Check, ArrowRight, ArrowLeft, User, Phone,
  Briefcase, Navigation, Heart, X
} from 'lucide-react';
import { getAllLocalities, events } from '../data/store';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const INTEREST_CATEGORIES = [
  { id: 'pothole', label: 'Roads & Potholes', icon: '🛣️' },
  { id: 'water', label: 'Water & Drainage', icon: '💧' },
  { id: 'garbage', label: 'Waste & Sanitation', icon: '🗑️' },
  { id: 'streetlight', label: 'Streetlighting', icon: '💡' },
  { id: 'traffic', label: 'Traffic', icon: '🚦' },
  { id: 'parks', label: 'Parks & Green', icon: '🌳' },
  { id: 'noise', label: 'Noise Pollution', icon: '🔊' },
  { id: 'drainage', label: 'Drainage Issues', icon: '🌊' },
];

const COMMUTE_MODES = [
  { id: 'two_wheeler', label: 'Two-Wheeler', icon: '🛵' },
  { id: 'public_transit', label: 'Public Transit', icon: '🚌' },
  { id: 'four_wheeler', label: 'Four-Wheeler', icon: '🚗' },
  { id: 'pedestrian', label: 'Walking', icon: '🚶' },
  { id: 'cycle', label: 'Bicycle', icon: '🚲' },
];

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

const OCCUPATIONS = [
  'Student', 'Professional / IT', 'Business Owner', 'Government Employee',
  'Healthcare Worker', 'Teacher / Educator', 'Retired', 'Other',
];

const PROFILE_KEY = 'civicpulse_profile_completed';
const QUIZ_PREFS_KEY = 'civicpulse_quiz_prefs';

/**
 * OnboardingSurvey — Full-page multi-step onboarding wizard.
 * Triggers automatically for first-time users to build their profile
 * for the AI recommendation engine.
 */
export default function OnboardingSurvey({ isOpen, onClose, onComplete }) {
  const localities = getAllLocalities();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('kothrud');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [commuteMode, setCommuteMode] = useState('');

  const TOTAL_STEPS = 4;

  useEffect(() => {
    if (!isOpen) return;
    // Pre-fill from existing data
    const saved = localStorage.getItem(QUIZ_PREFS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.locality) setSelectedLocality(parsed.locality);
        if (parsed.interests) setSelectedInterests(parsed.interests);
        if (parsed.commute) setCommuteMode(parsed.commute);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.ageRange) setAgeRange(parsed.ageRange);
        if (parsed.occupation) setOccupation(parsed.occupation);
      } catch (e) { /* ignore */ }
    }
    // Pre-fill name from auth
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  function toggleInterest(id) {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  function canProceed() {
    switch (step) {
      case 1: return fullName.trim().length >= 2;
      case 2: return selectedLocality;
      case 3: return selectedInterests.length > 0;
      case 4: return commuteMode;
      default: return true;
    }
  }

  async function handleFinish() {
    setSaving(true);
    const prefs = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      ageRange,
      occupation,
      locality: selectedLocality,
      interests: selectedInterests,
      commute: commuteMode,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(QUIZ_PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem(PROFILE_KEY, 'true');

    if (supabase && user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: prefs.fullName,
          locality_id: selectedLocality,
          interests: selectedInterests,
          commute_mode: commuteMode,
        });
      } catch (e) {
        console.error('Failed to sync profile to Supabase:', e);
      }
    }

    events.emit('quizCompleted', prefs);
    setSaving(false);
    if (onComplete) onComplete(prefs);
    onClose();
  }

  return (
    <div className="onboarding-backdrop animate-fade-in">
      <div className="onboarding-container animate-scale-in">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-header-content">
            <div className="onboarding-icon-wrapper animate-pulse-glow">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Welcome to CivicPulse
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
                Let's set up your profile to personalize your civic experience
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="onboarding-steps">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className="onboarding-step-track">
              <div
                className={`onboarding-step-fill ${s <= step ? 'active' : ''}`}
                style={{ width: s < step ? '100%' : s === step ? '50%' : '0%' }}
              />
            </div>
          ))}
          <span className="onboarding-step-label">Step {step} of {TOTAL_STEPS}</span>
        </div>

        {/* Step Content */}
        <div className="onboarding-content">
          {step === 1 && (
            <div className="animate-fade-in-right">
              <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                <User size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--secondary)' }} />
                Tell us about yourself
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                This helps us build your civic profile.
              </p>
              <div className="onboarding-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Mehta"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ height: '44px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ height: '44px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Age Range</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {AGE_RANGES.map(age => (
                      <button
                        key={age}
                        type="button"
                        className={`onboarding-chip ${ageRange === age ? 'selected' : ''}`}
                        onClick={() => setAgeRange(age)}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <select
                    className="form-input"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    style={{ height: '44px' }}
                  >
                    <option value="">Select...</option>
                    {OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-right">
              <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                <MapPin size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--secondary)' }} />
                Where is your home ward?
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                We'll prioritize civic issues happening right in your neighborhood.
              </p>
              <div className="form-group">
                <label className="form-label">Select Locality</label>
                <select
                  className="form-input"
                  value={selectedLocality}
                  onChange={e => setSelectedLocality(e.target.value)}
                  style={{ height: '48px', fontSize: '15px' }}
                >
                  {localities.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-right">
              <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                <Heart size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
                What issues matter most?
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                Select all civic areas you care about for personalized rankings.
              </p>
              <div className="onboarding-interest-grid">
                {INTEREST_CATEGORIES.map(cat => {
                  const isSelected = selectedInterests.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={`onboarding-interest-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleInterest(cat.id)}
                    >
                      <div style={{ fontSize: '28px' }}>{cat.icon}</div>
                      <div className="onboarding-interest-label">{cat.label}</div>
                      {isSelected && (
                        <div className="onboarding-interest-check">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in-right">
              <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
                <Navigation size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--secondary)' }} />
                How do you usually commute?
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                Helps us alert you about road closures, hazards, or transit disruptions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {COMMUTE_MODES.map(mode => {
                  const isSelected = commuteMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      className={`onboarding-commute-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCommuteMode(mode.id)}
                    >
                      <span style={{ fontSize: '24px' }}>{mode.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{mode.label}</span>
                      {isSelected && <Check size={16} color="var(--secondary)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="onboarding-footer">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} style={{ height: '44px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < TOTAL_STEPS ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              style={{ height: '44px', minWidth: '140px' }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleFinish}
              disabled={saving || !canProceed()}
              style={{ height: '44px', minWidth: '180px' }}
            >
              {saving ? 'Saving...' : 'Start Exploring ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
