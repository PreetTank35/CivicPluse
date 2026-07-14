import { useState } from 'react';
import { Users, Shield, MapPin, Plus, Trash2 } from 'lucide-react';
import { getAllUsers, getAllLocalities } from '../../data/store';

/**
 * CPModerators — Super admin only. Assign/remove locality moderators.
 */
export default function CPModerators() {
  const users = getAllUsers();
  const localities = getAllLocalities();
  const moderators = users.filter(u => u.role === 'moderator');
  const citizens = users.filter(u => u.role === 'citizen');

  return (
    <div className="cp-page">
      <div className="cp-page-header">
        <div>
          <h2 className="cp-page-title">Moderators</h2>
          <p className="cp-page-subtitle">Manage locality moderators and their zone assignments</p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> Assign Moderator
        </button>
      </div>

      {/* Active Moderators */}
      <div className="cp-section">
        <h3 className="cp-section-title">
          <Shield size={16} /> Active Moderators ({moderators.length})
        </h3>
        <div className="cp-moderators-grid">
          {moderators.length > 0 ? moderators.map(mod => {
            const locality = localities.find(l => l.id === mod.assigned_locality_id);
            return (
              <div key={mod.id} className="cp-mod-card">
                <div className="cp-mod-avatar">{mod.avatar || mod.name?.[0]}</div>
                <div className="cp-mod-info">
                  <div className="cp-mod-name">{mod.name}</div>
                  <div className="cp-mod-email">{mod.email}</div>
                  <div className="cp-mod-locality">
                    <MapPin size={10} />
                    <span>{locality?.name || 'Unassigned'}</span>
                    {locality?.ward_number && <span className="cp-mod-ward">{locality.ward_number}</span>}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Remove moderator">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          }) : (
            <div className="cp-empty" style={{ padding: '32px' }}>
              <Shield size={28} style={{ opacity: 0.4 }} />
              <p>No moderators assigned yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Localities */}
      <div className="cp-section">
        <h3 className="cp-section-title">
          <MapPin size={16} /> Locality Coverage
        </h3>
        <div className="cp-locality-coverage">
          {localities.map(loc => {
            const assignedMod = moderators.find(m => m.assigned_locality_id === loc.id);
            return (
              <div key={loc.id} className={`cp-locality-item ${assignedMod ? 'covered' : 'uncovered'}`}>
                <div className="cp-locality-name">{loc.name}</div>
                <div className="cp-locality-ward">{loc.ward_number} • {loc.pincode}</div>
                {assignedMod ? (
                  <div className="cp-locality-assigned">
                    <Shield size={10} /> {assignedMod.name}
                  </div>
                ) : (
                  <div className="cp-locality-unassigned">Needs moderator</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
