import { useState, useRef } from 'react';
import { X, MapPin, Camera, Video, Upload, AlertCircle, Film, Image, CheckCircle, Trash2 } from 'lucide-react';
import { createIssue, getAllLocalities } from '../data/store';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_DURATION_SEC = 60;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export default function ReportIssueModal({ isOpen, onClose }) {
  const localities = getAllLocalities();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' | 'video'
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    locality: '',
    address: '',
    lat: 18.5204,
    lng: 73.8567,
  });

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError(null);

    if (mediaType === 'photo') {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setMediaError('Please select a JPEG, PNG, or WebP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMediaError('Image must be under 10MB.');
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        setMediaError('Please select an MP4 or WebM video.');
        return;
      }
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setMediaError(`Video must be under ${MAX_VIDEO_SIZE_MB}MB.`);
        return;
      }
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration > MAX_VIDEO_DURATION_SEC) {
          setMediaError(`Video must be under ${MAX_VIDEO_DURATION_SEC} seconds. Yours is ${Math.round(tempVideo.duration)}s.`);
          URL.revokeObjectURL(url);
          return;
        }
        setMediaFile(file);
        setMediaPreview(url);
      };
      tempVideo.src = url;
    }
  }

  function clearMedia() {
    if (mediaPreview && mediaPreview.startsWith('blob:')) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const fileToDataUrl = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let finalMediaUrl = null;
    if (mediaFile) {
      if (supabase) {
        try {
          const fileExt = mediaFile.name.split('.').pop();
          const fileName = `${user?.id || 'anon'}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('evidence')
            .upload(fileName, mediaFile, { cacheControl: '3600', upsert: false });
          if (!error && data) {
            const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(fileName);
            finalMediaUrl = urlData?.publicUrl;
          }
        } catch (err) {
          console.error('Supabase storage upload failed, falling back to data URL:', err);
        }
      }
      if (!finalMediaUrl) {
        finalMediaUrl = await fileToDataUrl(mediaFile);
      }
    }

    createIssue({
      title: formData.title,
      description: formData.description,
      category: formData.category || 'pothole',
      severity: formData.severity,
      locality: formData.locality,
      location: {
        locality_name: localities.find(l => l.id === formData.locality)?.name || 'Pune',
        city: 'Pune',
        state: 'Maharashtra',
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
      department: 'dept-pw',
      evidence: finalMediaUrl ? [finalMediaUrl] : [],
      video_url: mediaType === 'video' && finalMediaUrl ? finalMediaUrl : null,
    });

    setSubmitting(false);
    setStep(1);
    clearMedia();
    setFormData({
      title: '', description: '', category: '', severity: 'medium',
      locality: '', address: '', lat: 18.5204, lng: 73.8567,
    });
    onClose();
  };

  function handleClose() {
    clearMedia();
    setStep(1);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 'var(--z-modal)',
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)' }}>Report an Issue</h2>
          <button className="btn btn-ghost btn-sm" onClick={handleClose}><X size={20} /></button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '3px',
              borderRadius: '999px',
              background: step >= s ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Large pothole on Main Street" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="Describe the issue in detail..."></textarea>
            </div>

            {/* ── Media Upload with Photo/Video toggle ── */}
            <div className="form-group">
              <label className="form-label">Evidence</label>

              {/* Media type tabs */}
              <div className="media-upload-tabs">
                <button
                  type="button"
                  className={`media-upload-tab ${mediaType === 'photo' ? 'active' : ''}`}
                  onClick={() => { setMediaType('photo'); clearMedia(); }}
                >
                  <Image size={14} /> Photo
                </button>
                <button
                  type="button"
                  className={`media-upload-tab ${mediaType === 'video' ? 'active' : ''}`}
                  onClick={() => { setMediaType('video'); clearMedia(); }}
                >
                  <Film size={14} /> Video Reel
                </button>
              </div>

              {/* Upload zone */}
              {!mediaPreview ? (
                <div
                  className="media-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {mediaType === 'photo' ? (
                    <Camera size={32} style={{ margin: '0 auto var(--space-sm)' }} />
                  ) : (
                    <Video size={32} style={{ margin: '0 auto var(--space-sm)' }} />
                  )}
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                    Click to upload {mediaType === 'photo' ? 'a photo' : 'a video'}
                  </div>
                  <div className="media-constraints">
                    {mediaType === 'photo'
                      ? 'JPEG, PNG, WebP • Max 10MB'
                      : `MP4, WebM • Max ${MAX_VIDEO_SIZE_MB}MB • Max ${MAX_VIDEO_DURATION_SEC}s`
                    }
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', marginTop: '8px', color: 'var(--accent)' }}>
                    AI will automatically analyze the {mediaType}
                  </div>
                </div>
              ) : (
                <div className="media-upload-zone has-file" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success)' }}>
                      {mediaType === 'photo' ? 'Photo' : 'Video'} selected
                    </span>
                    <button
                      type="button"
                      onClick={clearMedia}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {mediaType === 'photo' ? (
                    <img src={mediaPreview} alt="Preview" className="video-preview-thumb" />
                  ) : (
                    <video
                      ref={videoRef}
                      src={mediaPreview}
                      className="video-preview-thumb"
                      controls
                      muted
                      style={{ maxHeight: '180px' }}
                    />
                  )}
                </div>
              )}

              {mediaError && (
                <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {mediaError}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === 'photo' ? ACCEPTED_IMAGE_TYPES.join(',') : ACCEPTED_VIDEO_TYPES.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Next: Location</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Locality</label>
              <select className="form-input" name="locality" value={formData.locality} onChange={handleChange} required>
                <option value="">Select your area</option>
                {localities.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address / Landmark</label>
              <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} required placeholder="Near Central Mall..." />
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-input" name="severity" value={formData.severity} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category (AI Detected)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--accent-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)' }}>
                <AlertCircle size={18} color="var(--accent)" />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600 }}>We'll automatically route this based on your description.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
