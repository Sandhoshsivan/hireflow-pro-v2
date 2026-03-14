import { useEffect, useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import {
  Save,
  User,
  FileText,
  Code2,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

/* ─── Types ─── */
interface ExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  languages: string[];
}

const emptyResume: ResumeData = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  portfolio: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  languages: [],
};

const emptyExperience: ExperienceEntry = {
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  description: '',
};

const emptyEducation: EducationEntry = {
  institution: '',
  degree: '',
  field: '',
  year: '',
};

/* ─── Chip Input Component ─── */
function ChipInput({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addItems = (raw: string) => {
    const newItems = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !items.includes(s));
    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addItems(inputValue);
    }
    if (e.key === 'Backspace' && inputValue === '' && items.length > 0) {
      onChange(items.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addItems(inputValue);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '8px 10px',
        minHeight: 42,
        background: 'var(--white)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-md)',
        cursor: 'text',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px 3px 10px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            background: 'var(--blue-lt)',
            color: 'var(--blue)',
            border: '1px solid var(--blue-md)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}
        >
          {item}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(i);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: 9999,
              border: 'none',
              background: 'rgba(26, 86, 219, 0.15)',
              color: 'var(--blue)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26, 86, 219, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26, 86, 219, 0.15)';
            }}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={items.length === 0 ? placeholder : ''}
        style={{
          flex: 1,
          minWidth: 120,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 13,
          color: 'var(--text)',
          padding: 0,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}

/* ─── Main Component ─── */
export default function ResumeProfile() {
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ResumeData>({ ...emptyResume });

  /* Helper to parse JSON-string fields safely */
  const safeParse = <T,>(val: unknown, fallback: T): T => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val) as T;
      } catch {
        return fallback;
      }
    }
    return val as T;
  };

  /* Load profile on mount */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/resume-profile');
        const d = res.data;
        setData({
          fullName: d.fullName ?? '',
          title: d.title ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          location: d.location ?? '',
          linkedIn: d.linkedIn ?? '',
          portfolio: d.portfolio ?? '',
          summary: d.summary ?? '',
          skills: safeParse<string[]>(d.skills, []),
          experience: safeParse<ExperienceEntry[]>(d.experience, []),
          education: safeParse<EducationEntry[]>(d.education, []),
          certifications: safeParse<string[]>(d.certifications, []),
          languages: safeParse<string[]>(d.languages, []),
        });
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) {
          addToast('error', 'Failed to load resume profile');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Save profile */
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/resume-profile', {
        fullName: data.fullName,
        title: data.title,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedIn: data.linkedIn,
        portfolio: data.portfolio,
        summary: data.summary,
        skills: JSON.stringify(data.skills),
        experience: JSON.stringify(data.experience),
        education: JSON.stringify(data.education),
        certifications: JSON.stringify(data.certifications),
        languages: JSON.stringify(data.languages),
      });
      // Refetch from server to confirm persistence and sync state
      try {
        const res = await api.get('/resume-profile');
        const d = res.data;
        setData({
          fullName: d.fullName ?? '',
          title: d.title ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          location: d.location ?? '',
          linkedIn: d.linkedIn ?? '',
          portfolio: d.portfolio ?? '',
          summary: d.summary ?? '',
          skills: safeParse<string[]>(d.skills, []),
          experience: safeParse<ExperienceEntry[]>(d.experience, []),
          education: safeParse<EducationEntry[]>(d.education, []),
          certifications: safeParse<string[]>(d.certifications, []),
          languages: safeParse<string[]>(d.languages, []),
        });
      } catch {
        // Save succeeded, refetch failed — data is still in local state
      }
      addToast('success', 'Resume profile saved successfully');
    } catch {
      addToast('error', 'Failed to save resume profile');
    } finally {
      setSaving(false);
    }
  };

  /* Field updater */
  const updateField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  /* Experience helpers */
  const addExperience = () => {
    updateField('experience', [...data.experience, { ...emptyExperience }]);
  };
  const removeExperience = (index: number) => {
    updateField('experience', data.experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = data.experience.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry,
    );
    updateField('experience', updated);
  };

  /* Education helpers */
  const addEducation = () => {
    updateField('education', [...data.education, { ...emptyEducation }]);
  };
  const removeEducation = (index: number) => {
    updateField('education', data.education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = data.education.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry,
    );
    updateField('education', updated);
  };

  /* Loading state */
  if (loading) {
    return (
      <div
        className="page-content"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading resume profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Resume Profile"
        subtitle="Your master resume data for AI tailoring"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        }
      />

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Personal Info ── */}
        <div className="card animate-fade-up">
          <div className="card-header">
            <span className="card-title">
              <User size={15} style={{ color: 'var(--blue)' }} />
              Personal Information
            </span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={data.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Senior .NET Developer"
                  value={data.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  value={data.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="San Francisco, CA"
                  value={data.location}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={data.linkedIn}
                  onChange={(e) => updateField('linkedIn', e.target.value)}
                />
              </div>
              <div className="form-group full">
                <label className="form-label">Portfolio URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://johndoe.dev"
                  value={data.portfolio}
                  onChange={(e) => updateField('portfolio', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Professional Summary ── */}
        <div className="card animate-fade-up stagger-1">
          <div className="card-header">
            <span className="card-title">
              <FileText size={15} style={{ color: 'var(--violet)' }} />
              Professional Summary
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Summary</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Write a brief professional summary highlighting your experience, expertise, and career goals..."
                value={data.summary}
                onChange={(e) => updateField('summary', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="card animate-fade-up stagger-2">
          <div className="card-header">
            <span className="card-title">
              <Code2 size={15} style={{ color: 'var(--green)' }} />
              Skills
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Add skills (press Enter or comma to add)
              </label>
              <ChipInput
                items={data.skills}
                onChange={(items) => updateField('skills', items)}
                placeholder="e.g. React, TypeScript, Node.js, AWS..."
              />
            </div>
          </div>
        </div>

        {/* ── Work Experience ── */}
        <div className="card animate-fade-up stagger-3">
          <div className="card-header">
            <span className="card-title">
              <Briefcase size={15} style={{ color: 'var(--amber)' }} />
              Work Experience
            </span>
            <button className="btn btn-secondary btn-sm" onClick={addExperience}>
              <Plus size={13} />
              Add
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.experience.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: 'var(--text3)',
                  fontSize: 13,
                }}
              >
                No work experience added yet. Click "Add" to get started.
              </div>
            )}
            {data.experience.map((exp, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Experience #{index + 1}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--red)', padding: '4px 8px' }}
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Acme Corp"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Senior Developer"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Jan 2022"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Present"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe your responsibilities, achievements, and technologies used..."
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Education ── */}
        <div className="card animate-fade-up stagger-4">
          <div className="card-header">
            <span className="card-title">
              <GraduationCap size={15} style={{ color: 'var(--blue)' }} />
              Education
            </span>
            <button className="btn btn-secondary btn-sm" onClick={addEducation}>
              <Plus size={13} />
              Add
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.education.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: 'var(--text3)',
                  fontSize: 13,
                }}
              >
                No education entries added yet. Click "Add" to get started.
              </div>
            )}
            {data.education.map((edu, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Education #{index + 1}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--red)', padding: '4px 8px' }}
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MIT"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Computer Science"
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="2020"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Certifications ── */}
        <div className="card animate-fade-up stagger-5">
          <div className="card-header">
            <span className="card-title">
              <Award size={15} style={{ color: 'var(--amber)' }} />
              Certifications
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {data.certifications.length} cert{data.certifications.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Add certifications (press Enter or comma to add)
              </label>
              <ChipInput
                items={data.certifications}
                onChange={(items) => updateField('certifications', items)}
                placeholder="e.g. AWS Solutions Architect, Azure Certified..."
              />
            </div>
          </div>
        </div>

        {/* ── Languages ── */}
        <div className="card animate-fade-up stagger-6">
          <div className="card-header">
            <span className="card-title">
              <Languages size={15} style={{ color: 'var(--violet)' }} />
              Languages
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {data.languages.length} language{data.languages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Add languages (press Enter or comma to add)
              </label>
              <ChipInput
                items={data.languages}
                onChange={(items) => updateField('languages', items)}
                placeholder="e.g. English, Spanish, Hindi..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
