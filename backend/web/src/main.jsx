import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const emptySchool = {
  school_name: 'Al-Huda Quranic School',
  school_type: 'traditional_quranic_school',
  urgency: 'high',
  operator_name: 'Mallam Musa',
  phone: '+2348012345678',
  state: 'Kano',
  lga: 'Nasarawa',
  community: 'Tudun Wada',
  address: 'Behind main market',
  total_children: 120,
  boys_count: 90,
  girls_count: 30,
};

function App() {
  const [session, setSession] = useStoredState('ssa_session', null);
  const [notice, setNotice] = useState(null);

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.error || `Request failed with ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  function saveAuth(data, expectedRole) {
    if (data.user.role !== expectedRole) {
      setNotice({ type: 'error', text: 'This account cannot access this application.' });
      return;
    }
    setSession({
      token: data.access_token,
      role: data.user.role,
      user: data.user,
      profile_completed: data.profile_completed ?? true,
      profile: data.profile || null,
    });
    setNotice(null);
  }

  function logout() {
    setSession(null);
    setNotice(null);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <div className="brand">School Support Atlas</div>
          <div className="muted">React admin web + volunteer workflow tester</div>
        </div>
        {session && (
          <div className="session">
            <span>{session.user.name}</span>
            <span className="role">{session.role}</span>
            <button className="ghost" onClick={logout}>Sign out</button>
          </div>
        )}
      </header>

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}

      {!session && <AuthScreen api={api} onAuth={saveAuth} setNotice={setNotice} />}
      {session?.role === 'volunteer' && (
        <VolunteerApp
          api={api}
          session={session}
          setSession={setSession}
          setNotice={setNotice}
        />
      )}
      {session?.role === 'admin' && <AdminApp api={api} setNotice={setNotice} />}
    </div>
  );
}

function AuthScreen({ api, onAuth, setNotice }) {
  const [mode, setMode] = useState('volunteer-signup');
  const [form, setForm] = useState({
    name: 'Postman Volunteer',
    email: 'volunteer.web@example.com',
    password: 'secret123',
    adminEmail: 'admin@schoolsupportatlas.local',
    adminPassword: 'admin123',
  });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === 'volunteer-signup') {
        const res = await api('/auth/sign-up', {
          method: 'POST',
          body: { name: form.name, email: form.email, password: form.password },
        });
        onAuth(res.data, 'volunteer');
      } else if (mode === 'volunteer-login') {
        const res = await api('/auth/sign-in', {
          method: 'POST',
          body: { email: form.email, password: form.password, role: 'volunteer' },
        });
        onAuth(res.data, 'volunteer');
      } else {
        const res = await api('/auth/sign-in', {
          method: 'POST',
          body: { email: form.adminEmail, password: form.adminPassword, role: 'admin' },
        });
        onAuth(res.data, 'admin');
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-grid">
      <section className="panel">
        <div className="tabs">
          <button className={mode === 'volunteer-signup' ? 'active' : ''} onClick={() => setMode('volunteer-signup')}>Volunteer sign up</button>
          <button className={mode === 'volunteer-login' ? 'active' : ''} onClick={() => setMode('volunteer-login')}>Volunteer login</button>
          <button className={mode === 'admin-login' ? 'active' : ''} onClick={() => setMode('admin-login')}>Admin login</button>
        </div>

        <form onSubmit={submit} className="form">
          {mode === 'volunteer-signup' && (
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
          )}

          {mode === 'admin-login' ? (
            <>
              <label>
                Admin email
                <input value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              </label>
              <label>
                Admin password
                <input type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <label>
                Volunteer email
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>
                Password
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
            </>
          )}

          <button className="primary" disabled={busy}>{busy ? 'Working...' : 'Continue'}</button>
        </form>
      </section>

      <section className="panel side-note">
        <h2>Test order</h2>
        <ol>
          <li>Sign up as volunteer.</li>
          <li>Complete volunteer profile.</li>
          <li>Submit a school.</li>
          <li>Sign out and login as admin.</li>
          <li>Open notifications and approve the school.</li>
          <li>View approved school in public list.</li>
        </ol>
      </section>
    </main>
  );
}

function VolunteerApp({ api, session, setSession, setNotice }) {
  const [profile, setProfile] = useState({
    full_name: session.user.name || 'Postman Volunteer',
    phone: '+2348012345678',
    state: 'Kano',
    lga: 'Nasarawa',
    community: 'Tudun Wada',
    address: 'Near central mosque',
    bio: 'Community education volunteer',
  });
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [schoolForm, setSchoolForm] = useState(emptySchool);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const needsProfile = !session.profile_completed;

  useEffect(() => {
    if (!needsProfile) refresh();
  }, [needsProfile]);

  async function refresh() {
    try {
      const [dashboard, list, notes] = await Promise.all([
        api('/volunteer/dashboard'),
        api('/volunteer/schools'),
        api('/volunteer/notifications'),
      ]);
      setStats(dashboard.data.stats);
      setSchools(list.data.items);
      setNotifications(notes.data.items);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const res = await api('/volunteer/profile', { method: 'PUT', body: profile });
      setSession({
        ...session,
        profile_completed: res.data.profile_completed,
        profile: res.data.profile,
      });
      setNotice({ type: 'success', text: 'Profile completed. Dashboard is now available.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function submitSchool(event) {
    event.preventDefault();
    try {
      const payload = {
        school: {
          school_name: schoolForm.school_name,
          school_type: schoolForm.school_type,
          urgency: schoolForm.urgency,
          operator_name: schoolForm.operator_name,
        },
        operators: [{ name: schoolForm.operator_name, phone: schoolForm.phone }],
        location: {
          country: 'Nigeria',
          state: schoolForm.state,
          lga: schoolForm.lga,
          community: schoolForm.community,
          address: schoolForm.address,
        },
        children_stats: {
          total_children: Number(schoolForm.total_children || 0),
          boys_count: Number(schoolForm.boys_count || 0),
          girls_count: Number(schoolForm.girls_count || 0),
        },
        welfare: {
          has_clean_water: false,
          has_sanitation: false,
          has_educational_materials: true,
          safety_child_labor: true,
          additional_notes: 'Submitted from simple React tester.',
        },
      };
      const res = await api('/volunteer/schools', { method: 'POST', body: payload });
      setSelectedSchool(res.data.school);
      setNotice({ type: 'success', text: 'School submitted. Admin notification created.' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function markNotificationRead(id) {
    try {
      const res = await api(`/volunteer/notifications/${id}/read`, { method: 'POST' });
      setSelectedNotification(res.data.notification);
      setNotice({ type: 'success', text: 'Notification marked as read.' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function markAllNotificationsRead() {
    try {
      await api('/volunteer/notifications/read-all', { method: 'POST' });
      setNotice({ type: 'success', text: 'All notifications marked as read.' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  if (needsProfile) {
    return (
      <main className="content-grid single">
        <section className="panel">
          <h2>Complete volunteer profile</h2>
          <ProfileForm profile={profile} setProfile={setProfile} onSubmit={saveProfile} />
        </section>
      </main>
    );
  }

  return (
    <main className="content-grid">
      <section className="panel">
        <h2>Volunteer dashboard</h2>
        <Stats stats={stats} />
        <button className="secondary" onClick={refresh}>Refresh</button>
      </section>

      <section className="panel">
        <h2>Submit school</h2>
        <SchoolForm form={schoolForm} setForm={setSchoolForm} onSubmit={submitSchool} />
      </section>

      <section className="panel wide">
        <div className="section-head">
          <h2>My notifications</h2>
          <button className="secondary" disabled={!notifications.some((item) => item.status === 'unread')} onClick={markAllNotificationsRead}>Mark all read</button>
        </div>
        <Table
          rows={notifications}
          columns={[
            ['id', 'ID'],
            ['title', 'Title'],
            ['type', 'Type'],
            ['status', 'Status'],
            ['school_id', 'School ID'],
          ]}
          onRow={setSelectedNotification}
        />
        {selectedNotification && (
          <div className="actions">
            <button className="primary" disabled={selectedNotification.status === 'read'} onClick={() => markNotificationRead(selectedNotification.id)}>Mark selected read</button>
          </div>
        )}
      </section>

      <section className="panel wide">
        <h2>My schools</h2>
        <Table
          rows={schools}
          columns={[
            ['id', 'ID'],
            ['school_name', 'School'],
            ['status', 'Status'],
            ['urgency', 'Urgency'],
          ]}
          onRow={setSelectedSchool}
        />
      </section>

      <DetailPanel title="Selected school" data={selectedSchool} />
      <DetailPanel title="Selected notification" data={selectedNotification} />
    </main>
  );
}

function AdminApp({ api, setNotice }) {
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const [dash, notes, vols, allSchools] = await Promise.all([
        api('/admin/dashboard'),
        api('/admin/notifications'),
        api('/admin/volunteers'),
        api('/admin/schools'),
      ]);
      setDashboard(dash.data);
      setNotifications(notes.data.items);
      setVolunteers(vols.data.items);
      setSchools(allSchools.data.items);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function loadVolunteer(id) {
    try {
      const res = await api(`/admin/volunteers/${id}`);
      setSelectedVolunteer(res.data);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function approve(id) {
    try {
      const res = await api(`/admin/schools/${id}/approve`, {
        method: 'POST',
        body: { comment: 'Verified and approved from React tester.' },
      });
      setSelectedSchool(res.data.school);
      setNotice({ type: 'success', text: 'School approved.' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function reject(id) {
    try {
      const res = await api(`/admin/schools/${id}/reject`, {
        method: 'POST',
        body: { comment: 'Rejected from React tester. Please correct details.' },
      });
      setSelectedSchool(res.data.school);
      setNotice({ type: 'success', text: 'School rejected.' });
      refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  return (
    <main className="content-grid">
      <section className="panel">
        <h2>Admin dashboard</h2>
        <Stats stats={dashboard?.stats} />
        <button className="secondary" onClick={refresh}>Refresh</button>
      </section>

      <section className="panel">
        <h2>Notifications</h2>
        <Table
          rows={notifications}
          columns={[
            ['id', 'ID'],
            ['title', 'Title'],
            ['status', 'Status'],
            ['school_id', 'School ID'],
          ]}
        />
      </section>

      <section className="panel">
        <h2>Volunteers</h2>
        <Table
          rows={volunteers}
          columns={[
            ['id', 'ID'],
            ['name', 'Name'],
            ['email', 'Email'],
            ['profile_completed', 'Profile'],
          ]}
          onRow={(row) => loadVolunteer(row.id)}
        />
      </section>

      <section className="panel wide">
        <h2>Schools for review</h2>
        <Table
          rows={schools}
          columns={[
            ['id', 'ID'],
            ['school_name', 'School'],
            ['status', 'Status'],
            ['submitted_by_user_id', 'Volunteer'],
          ]}
          onRow={setSelectedSchool}
        />
        {selectedSchool && (
          <div className="actions">
            <button className="primary" disabled={selectedSchool.status !== 'pending'} onClick={() => approve(selectedSchool.id)}>Approve selected</button>
            <button className="danger" disabled={selectedSchool.status !== 'pending'} onClick={() => reject(selectedSchool.id)}>Reject selected</button>
          </div>
        )}
      </section>

      <DetailPanel title="Selected volunteer" data={selectedVolunteer} />
      <DetailPanel title="Selected school" data={selectedSchool} />
    </main>
  );
}

function ProfileForm({ profile, setProfile, onSubmit }) {
  return (
    <form className="form grid-form" onSubmit={onSubmit}>
      {[
        ['full_name', 'Full name'],
        ['phone', 'Phone'],
        ['state', 'State'],
        ['lga', 'LGA'],
        ['community', 'Community'],
        ['address', 'Address'],
        ['bio', 'Bio'],
      ].map(([key, label]) => (
        <label key={key}>
          {label}
          <input value={profile[key] || ''} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
        </label>
      ))}
      <button className="primary">Save profile</button>
    </form>
  );
}

function SchoolForm({ form, setForm, onSubmit }) {
  const fields = [
    ['school_name', 'School name'],
    ['school_type', 'School type'],
    ['urgency', 'Urgency'],
    ['operator_name', 'Operator name'],
    ['phone', 'Operator phone'],
    ['state', 'State'],
    ['lga', 'LGA'],
    ['community', 'Community'],
    ['address', 'Address'],
    ['total_children', 'Total children'],
    ['boys_count', 'Boys'],
    ['girls_count', 'Girls'],
  ];

  return (
    <form className="form grid-form" onSubmit={onSubmit}>
      {fields.map(([key, label]) => (
        <label key={key}>
          {label}
          <input value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      ))}
      <button className="primary">Submit school</button>
    </form>
  );
}

function Stats({ stats }) {
  const entries = Object.entries(stats || {});
  if (!entries.length) return <div className="empty">No stats loaded.</div>;
  return (
    <div className="stats">
      {entries.map(([key, value]) => (
        <div className="stat" key={key}>
          <strong>{value}</strong>
          <span>{key.replaceAll('_', ' ')}</span>
        </div>
      ))}
    </div>
  );
}

function Table({ rows = [], columns, onRow }) {
  if (!rows.length) return <div className="empty">No records.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onRow?.(row)}>
              {columns.map(([key]) => <td key={key}>{formatCell(row[key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({ title, data }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <div className="empty">Select a record.</div>}
    </section>
  );
}

function formatCell(value) {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  if (value == null) return '';
  return String(value);
}

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

createRoot(document.getElementById('root')).render(<App />);
