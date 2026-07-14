import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Save, X, Mail, Globe } from 'lucide-react';
import { getAllDepartments } from '../../data/store';
import { CATEGORIES } from '../../data/mockData';

/**
 * CPDepartments — Super admin only. CRUD for government departments.
 */
export default function CPDepartments() {
  const [departments, setDepartments] = useState(() => getAllDepartments());
  const [editing, setEditing] = useState(null);

  return (
    <div className="cp-page">
      <div className="cp-page-header">
        <div>
          <h2 className="cp-page-title">Departments</h2>
          <p className="cp-page-subtitle">Map categories to government departments for escalation routing</p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Department
        </button>
      </div>

      <div className="cp-departments-grid">
        {departments.map(dept => {
          const cat = CATEGORIES.find(c => c.id === dept.category);
          return (
            <div key={dept.id} className="cp-dept-card">
              <div className="cp-dept-header">
                <div className="cp-dept-icon">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="cp-dept-name">{dept.name}</h4>
                  <span className="cp-dept-category">
                    {cat?.icon} {cat?.label || dept.category}
                  </span>
                </div>
              </div>
              <div className="cp-dept-details">
                <div className="cp-dept-row">
                  <Mail size={12} />
                  <span>{dept.contact_email || 'No email set'}</span>
                </div>
                <div className="cp-dept-row">
                  <Globe size={12} />
                  <span>{dept.webhook_url || 'No webhook'}</span>
                </div>
              </div>
              <div className="cp-dept-actions">
                <button className="btn btn-ghost btn-sm"><Edit2 size={12} /> Edit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
