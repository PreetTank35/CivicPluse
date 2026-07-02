import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Check, ArrowRight, X, Heart, Navigation } from 'lucide-react';
import { getAllLocalities, events } from '../data/store';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const INTEREST_CATEGORIES = [
  { id: 'pothole', label: 'Roads & Potholes', icon: '🛣️' },
  { id: 'water', label: 'Water & Drainage', icon: '💧' },
  { id: 'garbage', label: 'Waste & Sanitation', icon: '🗑️' },
  { id: 'streetlight', label: 'Streetlighting & Safety', icon: '💡' },
];

const COMMUTE_MODES = [
  { id: 'two_wheeler', label: 'Two-Wheeler (Bike/Scooter)', icon: '🛵' },
  { id: 'public_transit', label: 'Public Transit (Bus/Metro)', icon: '🚌' },
  { id: 'four_wheeler', label: 'Four-Wheeler (Car)', icon: '🚗' },
  { id: 'pedestrian', label: 'Walking / Pedestrian', icon: '🚶' },
];

export default function PersonalizationQuizModal({ isOpen, onClose, onComplete }) {
  const localities = getAllLocalities();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedLocality, setSelectedLocality] = useState('kothrud');
  const [selectedInterests, setSelectedInterests] = useState(['pothole', 'garbage']);
  const [commuteMode, setCommuteMode] = useState('two_wheeler');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('civicpulse_quiz_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.locality) setSelectedLocality(parsed.locality);
        if (parsed.interests) setSelectedInterests(parsed.interests);
        if (parsed.commute) setCommuteMode(parsed.commute);
      } catch (e) { /* ignore */ }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleInterest(id) {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setSaving(true);
    const prefs = {
      locality: selectedLocality,
      interests: selectedInterests,
      commute: commuteMode,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem('civicpulse_quiz_prefs', JSON.stringify(prefs));

    if (supabase && user?.id) {
      try {
        await supabase.from('profiles').update({
          locality_id: selectedLocality,
          interests: selectedInterests,
          commute_mode: commuteMode,
        }).eq('id', user.id);
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
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 2000 }}>
      <div className="modal" style={{ maxWidth: '480px', width: '90%', padding: 'var(--space-xl)', borderRadius: '16px', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
            <Sparkles size={20} /> Personalize Your Civic Feed
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-lg)' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Where in Pune is your home ward?</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
              We will prioritize civic issues and updates happening right in your neighborhood.
            </p>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Select Locality</label>
              <select
                className="form-input"
                value={selectedLocality}
                onChange={e => setSelectedLocality(e.target.value)}
                style={{ height: '44px', fontSize: '15px' }}
              >
                {localities.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', height: '44px' }} onClick={() => setStep(2)}>
              Next: Select Priorities <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>What issues matter most to you?</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Select all civic areas you care about for custom ranking.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {INTEREST_CATEGORIES.map(cat => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '22px' }}>{cat.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {cat.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: '44px' }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2, height: '44px' }} onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>How do you usually commute?</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Helps us alert you about road closures, traffic hazards, or public transit disruptions.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COMMUTE_MODES.map(mode => {
                const isSelected = commuteMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setCommuteMode(mode.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{mode.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', flex: 1, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{mode.label}</span>
                    {isSelected && <Check size={16} color="var(--primary)" />}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: '44px' }} onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2, height: '44px' }} onClick={handleFinish} disabled={saving}>
                {saving ? 'Saving...' : 'Finish & Personalize ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
