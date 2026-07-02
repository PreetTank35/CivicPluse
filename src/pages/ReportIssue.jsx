import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Camera, Sparkles, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { createIssue, getAllIssues } from '../data/store';
import { classifyIssue, findDuplicates } from '../data/aiClassifier';

const STEPS = ['Location', 'Details', 'Evidence', 'Review'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    address: '',
    lat: 12.9716,
    lng: 77.5946,
    photos: [],
  });
  const [aiResult, setAiResult] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Trigger AI classification when description changes
  const handleDescriptionChange = useCallback((e) => {
    const desc = e.target.value;
    updateForm('description', desc);

    if (desc.length > 20) {
      setIsClassifying(true);
      // Simulate API delay
      setTimeout(() => {
        const result = classifyIssue(form.title, desc);
        setAiResult(result);
        if (!form.category) updateForm('category', result.category);
        if (!form.severity) updateForm('severity', result.severity);

        // Check duplicates
        const dupes = findDuplicates(form.title || desc, getAllIssues());
        setDuplicates(dupes);
        setIsClassifying(false);
      }, 800);
    }
  }, [form.title, form.category, form.severity]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    updateForm('title', title);

    if (title.length > 10 && form.description.length > 10) {
      setTimeout(() => {
        const result = classifyIssue(title, form.description);
        setAiResult(result);
      }, 500);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          photos: [...prev.photos, { name: file.name, url: ev.target.result }],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = () => {
    const newIssue = createIssue({
      title: form.title,
      description: form.description,
      category: form.category || aiResult?.category || 'pothole',
      severity: form.severity || aiResult?.severity || 'medium',
      status: 'open',
      ward: 'ward-1',
      department: aiResult?.department || 'dept-pw',
      reporter: 'user-1',
      location: {
        lat: form.lat,
        lng: form.lng,
        address: form.address || 'Bangalore, Karnataka',
      },
      evidence: form.photos.map(p => typeof p === 'object' && p ? p.url : p),
      video_url: form.photos.find(p => p && (p.url || '').startsWith('data:video/'))?.url || null,
      ai_confidence: aiResult?.confidence || 0.75,
      ai_category: aiResult?.category || form.category,
      ai_severity: aiResult?.severity || form.severity,
    });

    setSubmitted(true);
    setTimeout(() => navigate(`/issue/${newIssue.id}`), 1500);
  };

  const canProceed = () => {
    if (step === 0) return form.address.length > 0;
    if (step === 1) return form.title.length > 5 && form.description.length > 10;
    return true;
  };

  if (submitted) {
    return (
      <div className="page-wrapper mesh-bg">
        <div className="container page-content">
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--success-bg)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-xl)',
            }}>
              <Check size={40} color="var(--success)" />
            </div>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>Issue Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your report has been received and AI has classified it.
              <br />Redirecting to issue details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper mesh-bg">
      <div className="container page-content">
        <div className="report-page">
          <div className="section-header text-center">
            <h2 className="section-title">Report an Issue</h2>
            <p className="section-subtitle">Help improve your community by reporting problems</p>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            {STEPS.map((s, idx) => (
              <div key={s} className="step" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={`step-number ${idx < step ? 'completed' : idx === step ? 'active' : ''}`}>
                  {idx < step ? <Check size={14} /> : idx + 1}
                </div>
                <span className={`step-label ${idx === step ? 'active' : ''}`}>{s}</span>
                {idx < STEPS.length - 1 && (
                  <div className={`step-connector ${idx < step ? 'completed' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Location */}
          {step === 0 && (
            <div className="card animate-fade-in">
              <h4 style={{ marginBottom: 'var(--space-lg)' }}>
                <MapPin size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
                Where is the issue?
              </h4>
              <div className="form-group">
                <label className="form-label">Address / Landmark</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 80 Feet Road, near Forum Mall, Koramangala"
                  value={form.address}
                  onChange={e => updateForm('address', e.target.value)}
                />
                <div className="form-hint">Enter the nearest landmark or full address</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.lat}
                    onChange={e => updateForm('lat', parseFloat(e.target.value))}
                    step="0.0001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.lng}
                    onChange={e => updateForm('lng', parseFloat(e.target.value))}
                    step="0.0001"
                  />
                </div>
              </div>

              <div className="form-hint" style={{ marginTop: 'var(--space-sm)', color: 'var(--info-light)' }}>
                💡 In production, this would use GPS auto-detect and an interactive map pin
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="card animate-fade-in">
              <h4 style={{ marginBottom: 'var(--space-lg)' }}>
                <Sparkles size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--info-light)' }} />
                Describe the issue
              </h4>

              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Large pothole on 80 Feet Road"
                  value={form.title}
                  onChange={handleTitleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the issue in detail — size, impact, how long it has been there..."
                  value={form.description}
                  onChange={handleDescriptionChange}
                  rows={4}
                />
              </div>

              {/* AI Classification Preview */}
              {(aiResult || isClassifying) && (
                <div className="ai-preview">
                  <div className="ai-preview-header">
                    <Sparkles size={16} />
                    {isClassifying ? 'AI is analyzing...' : 'AI Classification'}
                    {isClassifying && <div className="loading-spinner" style={{ width: 14, height: 14 }} />}
                  </div>
                  {aiResult && !isClassifying && (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        <span className="ai-tag">
                          {aiResult.categoryIcon} {aiResult.categoryLabel}
                        </span>
                        <span className="ai-tag" style={{
                          color: aiResult.severity === 'critical' ? 'var(--danger)' :
                                 aiResult.severity === 'high' ? 'var(--warning)' : 'var(--text-secondary)'
                        }}>
                          Severity: {aiResult.severity}
                        </span>
                        <span className="ai-tag">
                          🏢 {aiResult.departmentName}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        Confidence
                      </div>
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{
                            width: `${aiResult.confidence * 100}%`,
                            background: aiResult.confidence > 0.8 ? 'var(--success)' :
                                       aiResult.confidence > 0.6 ? 'var(--warning)' : 'var(--danger)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {Math.round(aiResult.confidence * 100)}% confident
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Duplicate warning */}
              {duplicates.length > 0 && (
                <div style={{
                  marginTop: 'var(--space-md)',
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md)',
                }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px' }}>
                    ⚠️ Possible Duplicates Found
                  </div>
                  {duplicates.map(d => (
                    <div key={d.issue.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      • {d.issue.title} ({Math.round(d.similarity * 100)}% match)
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <div className="form-group">
                  <label className="form-label">Category {aiResult && '(AI suggested)'}</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={e => updateForm('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity {aiResult && '(AI suggested)'}</label>
                  <select
                    className="form-select"
                    value={form.severity}
                    onChange={e => updateForm('severity', e.target.value)}
                  >
                    <option value="">Select severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Evidence */}
          {step === 2 && (
            <div className="card animate-fade-in">
              <h4 style={{ marginBottom: 'var(--space-lg)' }}>
                <Camera size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--success)' }} />
                Add Evidence (Optional)
              </h4>

              <label className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={32} color="var(--text-muted)" />
                <div style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Click to upload photos or drag and drop
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PNG, JPG up to 5MB each
                </div>
              </label>

              {form.photos.length > 0 && (
                <div className="upload-preview">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="upload-preview-item">
                      <img src={photo.url} alt={photo.name} />
                      <button className="upload-preview-remove" onClick={() => removePhoto(idx)}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card animate-fade-in">
              <h4 style={{ marginBottom: 'var(--space-lg)' }}>Review Your Report</h4>

              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div>
                  <div className="form-label">Title</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.title}</div>
                </div>
                <div>
                  <div className="form-label">Description</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{form.description}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <div className="form-label">Category</div>
                    <div>{CATEGORIES.find(c => c.id === form.category)?.icon} {CATEGORIES.find(c => c.id === form.category)?.label || form.category}</div>
                  </div>
                  <div>
                    <div className="form-label">Severity</div>
                    <div style={{ textTransform: 'capitalize' }}>{form.severity}</div>
                  </div>
                  <div>
                    <div className="form-label">Department</div>
                    <div>{aiResult?.departmentName || 'Auto-assigned'}</div>
                  </div>
                </div>
                <div>
                  <div className="form-label">Location</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{form.address}</div>
                </div>
                {form.photos.length > 0 && (
                  <div>
                    <div className="form-label">Evidence</div>
                    <div>{form.photos.length} photo(s) attached</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
            {step > 0 ? (
              <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                style={{ opacity: canProceed() ? 1 : 0.5 }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                <Check size={18} /> Submit Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
