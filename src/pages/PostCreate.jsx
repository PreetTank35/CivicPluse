import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, MapPin, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react';
import { createProblem, getDuplicateCandidates } from '../data/store';
import { getNearestLocality } from '../data/localities';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from '../lib/AuthContext';

const STEPS = ['media', 'location', 'category', 'description', 'review'];
const STEP_LABELS = ['Photo/Video', 'Location', 'Category', 'Description', 'Review'];

/**
 * PostCreate — Multi-step problem creation flow.
 * (a) Capture/upload → (b) GPS pin → (c) Category → (d) Description → (e) Review + duplicate check → Submit
 */
export default function PostCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567, address: '' });
  const [locationLoading, setLocationLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect GPS on location step
  useEffect(() => {
    if (step === 1 && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [step]);

  // Check for duplicates before review step
  useEffect(() => {
    if (step === 4 && category && location.lat) {
      const candidates = getDuplicateCandidates(category, location.lat, location.lng);
      setDuplicates(candidates);
    }
  }, [step, category, location.lat, location.lng]);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...mediaFiles, ...files].slice(0, 5);
    setMediaFiles(newFiles);

    // Generate previews
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(previews);
  }

  function removeMedia(idx) {
    const newFiles = mediaFiles.filter((_, i) => i !== idx);
    const newPreviews = mediaPreviews.filter((_, i) => i !== idx);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  }

  function canAdvance() {
    switch (step) {
      case 0: return mediaFiles.length > 0;
      case 1: return location.lat && location.lng;
      case 2: return category !== '';
      case 3: return title.trim().length >= 5 && description.trim().length >= 10;
      case 4: return true;
      default: return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    const locality = getNearestLocality(location.lat, location.lng);

    // For demo mode, use preview URLs as media_urls
    const mediaUrls = mediaPreviews.length > 0 ? mediaPreviews : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop'];

    const result = createProblem({
      title: title.trim(),
      description: description.trim(),
      category,
      media_urls: mediaUrls,
      location_lat: location.lat,
      location_lng: location.lng,
      location_address: location.address || `${locality?.name || 'Pune'}, Maharashtra`,
      locality_id: locality?.id,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Small delay for UX satisfaction
    setTimeout(() => {
      navigate('/');
    }, 500);
  }

  return (
    <div className="post-create-page">
      {/* ── Header ── */}
      <div className="post-create-header">
        <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}>
          <ChevronLeft size={20} />
          <span>{step > 0 ? 'Back' : 'Cancel'}</span>
        </button>
        <h2 className="post-create-title">Report Problem</h2>
        <div className="post-create-step-label">
          {step + 1}/{STEPS.length}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="post-create-progress">
        <div
          className="post-create-progress-fill"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* ── Step Content ── */}
      <div className="post-create-body">

        {/* Step 1: Media */}
        {step === 0 && (
          <div className="post-step animate-fade-in">
            <h3 className="post-step-title">📸 Add Photo or Video</h3>
            <p className="post-step-desc">Visual evidence helps verify your report and speeds up resolution.</p>

            {mediaPreviews.length > 0 && (
              <div className="post-media-preview-grid">
                {mediaPreviews.map((url, i) => (
                  <div key={i} className="post-media-preview-item">
                    <img src={url} alt={`Evidence ${i + 1}`} />
                    <button className="post-media-remove" onClick={() => removeMedia(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="post-media-upload-area" onClick={() => fileInputRef.current?.click()}>
              <Camera size={32} />
              <span>Tap to capture or upload</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>Max 5 photos/videos</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="post-step animate-fade-in">
            <h3 className="post-step-title">📍 Confirm Location</h3>
            <p className="post-step-desc">We auto-detected your location. Adjust if needed.</p>

            <div className="post-location-map-placeholder">
              {locationLoading ? (
                <div className="post-location-loading">
                  <div className="loading-spinner" style={{ width: 24, height: 24 }} />
                  <span>Detecting location...</span>
                </div>
              ) : (
                <div className="post-location-display">
                  <MapPin size={28} color="var(--brand-saffron)" />
                  <div className="post-location-coords">
                    <span>Lat: {location.lat.toFixed(4)}</span>
                    <span>Lng: {location.lng.toFixed(4)}</span>
                  </div>
                  <span className="post-location-locality">
                    {getNearestLocality(location.lat, location.lng)?.name || 'Pune'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Address (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Near MIT College, Paud Road"
                value={location.address}
                onChange={e => setLocation(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 3: Category */}
        {step === 2 && (
          <div className="post-step animate-fade-in">
            <h3 className="post-step-title">🏷️ Select Category</h3>
            <p className="post-step-desc">This helps route your report to the right department.</p>

            <div className="post-category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`post-category-item ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="post-category-icon">{cat.icon}</span>
                  <span className="post-category-label">{cat.label}</span>
                  {category === cat.id && <Check size={16} className="post-category-check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Description */}
        {step === 3 && (
          <div className="post-step animate-fade-in">
            <h3 className="post-step-title">✍️ Describe the Problem</h3>
            <p className="post-step-desc">A clear title and description help others understand the issue.</p>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Large pothole near Paud Road signal"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
              <span className="form-hint">{title.length}/100</span>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input"
                placeholder="Explain the problem in detail. How long has it been here? How is it affecting people?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <span className="form-hint">{description.length}/500</span>
            </div>
          </div>
        )}

        {/* Step 5: Review + Duplicate Check */}
        {step === 4 && (
          <div className="post-step animate-fade-in">
            <h3 className="post-step-title">👀 Review & Submit</h3>

            {/* Duplicate warning */}
            {duplicates.length > 0 && (
              <div className="post-duplicate-warning">
                <AlertCircle size={18} />
                <div>
                  <strong>Similar issues found nearby!</strong>
                  <p>Consider supporting an existing report instead of creating a duplicate:</p>
                  {duplicates.slice(0, 3).map(d => (
                    <button
                      key={d.id}
                      className="post-duplicate-item"
                      onClick={() => navigate(`/problem/${d.id}`)}
                    >
                      {d.title} — {d.support_count} supporters
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Review summary */}
            <div className="post-review-summary">
              {mediaPreviews.length > 0 && (
                <img src={mediaPreviews[0]} alt="Evidence" className="post-review-image" />
              )}
              <div className="post-review-details">
                <div className="post-review-row">
                  <span className="post-review-label">Category</span>
                  <span>{CATEGORIES.find(c => c.id === category)?.icon} {CATEGORIES.find(c => c.id === category)?.label}</span>
                </div>
                <div className="post-review-row">
                  <span className="post-review-label">Location</span>
                  <span>{location.address || getNearestLocality(location.lat, location.lng)?.name}</span>
                </div>
                <div className="post-review-row">
                  <span className="post-review-label">Title</span>
                  <span style={{ fontWeight: 600 }}>{title}</span>
                </div>
                <div className="post-review-row">
                  <span className="post-review-label">Description</span>
                  <span>{description}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="post-error">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Actions ── */}
      <div className="post-create-footer">
        {step < 4 ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
            style={{ width: '100%' }}
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Submitting...' : '🚀 Submit Report'}
          </button>
        )}
      </div>
    </div>
  );
}
