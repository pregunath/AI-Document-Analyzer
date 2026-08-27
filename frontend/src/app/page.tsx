'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  FolderOpen,
  Grid2X2,
  LayoutList,
  LoaderCircle,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

type DocumentStatus = 'Completed' | 'Processing' | 'Failed';

type DocumentItem = {
  name: string;
  type: string;
  size: string;
  date: string;
  status: DocumentStatus;
  initials: string;
  color: string;
};

const initialDocuments: DocumentItem[] = [
  {
    name: 'Q3 Investor Briefing.pdf',
    type: 'PDF document',
    size: '2.4 MB',
    date: 'Today, 9:42 AM',
    status: 'Completed',
    initials: 'QB',
    color: 'coral',
  },
  {
    name: 'Acme Supply Agreement.pdf',
    type: 'PDF document',
    size: '1.8 MB',
    date: 'Today, 8:16 AM',
    status: 'Processing',
    initials: 'AS',
    color: 'mint',
  },
  {
    name: 'Product Research Notes.jpg',
    type: 'Image',
    size: '4.1 MB',
    date: 'Yesterday, 4:28 PM',
    status: 'Completed',
    initials: 'PR',
    color: 'lavender',
  },
  {
    name: 'NDA - Northstar Labs.pdf',
    type: 'PDF document',
    size: '892 KB',
    date: 'Yesterday, 11:03 AM',
    status: 'Failed',
    initials: 'NL',
    color: 'yellow',
  },
  {
    name: 'Brand Guidelines 2025.pdf',
    type: 'PDF document',
    size: '6.7 MB',
    date: 'Aug 24, 2025',
    status: 'Completed',
    initials: 'BG',
    color: 'blue',
  },
];

const navItems = [
  { label: 'Overview', icon: Grid2X2 },
  { label: 'Documents', icon: FileText },
  { label: 'Collections', icon: FolderOpen },
];

export default function Home() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [activeNav, setActiveNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filteredDocuments = useMemo(
    () => documents.filter((document) => document.name.toLowerCase().includes(query.toLowerCase())),
    [documents, query],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const isSupported = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
    if (!isSupported || file.size > 10 * 1024 * 1024) return;

    const newDocument: DocumentItem = {
      name: file.name,
      type: file.type === 'application/pdf' ? 'PDF document' : 'Image',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: 'Just now',
      status: 'Processing',
      initials: file.name.slice(0, 2).toUpperCase(),
      color: 'mint',
    };
    setDocuments((current) => [newDocument, ...current]);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files);

  return (
    <AuthGate>
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <Sparkles size={16} strokeWidth={2.5} />
        </div>
        <div className="brand-name">clearframe</div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <div className="nav-label">Workspace</div>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
              key={label}
              onClick={() => setActiveNav(label)}
              type="button"
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === 'Documents' && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" type="button">
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
          <button className="nav-item" type="button">
            <CircleHelp size={17} />
            <span>Help center</span>
          </button>
          <div className="user-card">
            <div className="avatar">JD</div>
            <div className="user-details">
              <strong>Jordan Davis</strong>
              <span>Personal workspace</span>
            </div>
            <button
              aria-label="Open profile menu"
              className="icon-button subtle"
              onClick={() => setShowProfile(!showProfile)}
              type="button"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
          {showProfile && (
            <button className="logout-button" onClick={() => signOut()} type="button">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>{activeNav}</strong>
          </div>
          <div className="topbar-actions">
            <button aria-label="Notifications" className="icon-button" type="button">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="topbar-avatar">JD</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">Thursday, August 28, 2025</p>
              <h1>
                Good morning, Jordan <span>✦</span>
              </h1>
              <p className="lede">Make sense of your documents in less time.</p>
            </div>
            <button
              className="button button-dark"
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Plus size={17} /> Upload document
            </button>
          </section>

          <section className="stats-grid" aria-label="Workspace summary">
            <div className="stat-card">
              <div className="stat-icon soft-coral">
                <FileText size={18} />
              </div>
              <div>
                <span className="stat-label">Total documents</span>
                <strong>12</strong>
                <small className="up">+3 this month</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon soft-yellow">
                <Clock3 size={18} />
              </div>
              <div>
                <span className="stat-label">In progress</span>
                <strong>
                  {documents.filter((document) => document.status === 'Processing').length}
                </strong>
                <small>Usually under 2 min</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon soft-mint">
                <FileCheck2 size={18} />
              </div>
              <div>
                <span className="stat-label">Analyses complete</span>
                <strong>9</strong>
                <small className="up">+18% vs. last month</small>
              </div>
            </div>
          </section>

          <section
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
          >
            <input
              accept=".pdf,.png,.jpg,.jpeg"
              id="file-upload"
              onChange={handleInput}
              type="file"
            />
            <div className="upload-icon">
              <UploadCloud size={23} />
            </div>
            <div className="upload-copy">
              <strong>
                Drop a document here, or <label htmlFor="file-upload">browse</label>
              </strong>
              <span>PDF, PNG, or JPG up to 10 MB</span>
            </div>
            <div className="upload-hint">
              <span className="secure-dot">
                <Check size={11} />
              </span>{' '}
              Secure and private
            </div>
          </section>

          <section className="documents-section">
            <div className="section-heading">
              <div>
                <h2>Recent documents</h2>
                <p>Your latest uploads and analysis activity</p>
              </div>
              <button className="text-button" type="button">
                View all <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="toolbar">
              <div className="search-field">
                <Search size={16} />
                <input
                  aria-label="Search documents"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search documents..."
                  value={query}
                />
              </div>
              <button className="filter-button" type="button">
                All statuses <ChevronDown size={15} />
              </button>
              <div className="view-toggle">
                <button aria-label="List view" className="selected" type="button">
                  <LayoutList size={16} />
                </button>
                <button aria-label="Grid view" type="button">
                  <Grid2X2 size={16} />
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Uploaded</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr key={`${document.name}-${document.date}`}>
                      <td>
                        <div className="document-cell">
                          <div className={`file-badge ${document.color}`}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <strong>{document.name}</strong>
                            <span>{document.type}</span>
                          </div>
                        </div>
                      </td>
                      <td>{document.date}</td>
                      <td>{document.size}</td>
                      <td>
                        <span className={`status ${document.status.toLowerCase()}`}>
                          {document.status === 'Processing' && (
                            <LoaderCircle className="spin" size={13} />
                          )}
                          {document.status === 'Completed' && <Check size={13} />}
                          {document.status === 'Failed' && <X size={13} />}
                          {document.status}
                        </span>
                      </td>
                      <td>
                        <button
                          aria-label={`More actions for ${document.name}`}
                          className="icon-button subtle"
                          type="button"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocuments.length === 0 && (
                <div className="empty-state">No documents match “{query}”.</div>
              )}
            </div>
          </section>
        </div>
        <footer className="footer">
          <span>
            <span className="online-dot" /> All systems operational
          </span>
          <span>Clearframe v0.1</span>
        </footer>
      </section>
    </main>
    </AuthGate>
  );
}
