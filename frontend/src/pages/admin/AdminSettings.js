import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../../redux/slices/settingsSlice';

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector(s => s.settings);
  const [f, setF] = useState({ adminName: '', adminDesignation: '', platformName: '' });
  const [sig, setSig] = useState(null);
  const [sigPreview, setSigPreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);
  useEffect(() => {
    if (settings) {
      setF({
        adminName: settings.adminName || '',
        adminDesignation: settings.adminDesignation || '',
        platformName: settings.platformName || '',
      });
      setSigPreview(settings.adminSignature || null);
      setLogoPreview(settings.platformLogo || null);
    }
  }, [settings]);

  const onSig = e => { const file = e.target.files[0]; if (file) { setSig(file); setSigPreview(URL.createObjectURL(file)); } };
  const onLogo = e => { const file = e.target.files[0]; if (file) { setLogo(file); setLogoPreview(URL.createObjectURL(file)); } };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (sig) fd.append('signature', sig);
    if (logo) fd.append('logo', logo);
    await dispatch(updateSettings(fd));
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <h4 className="mb-4">Platform Settings ⚙️</h4>
          <p className="text-muted small mb-4">
            This signature and name will appear on <strong>every certificate</strong> issued to students platform-wide.
          </p>

          {ok && <div className="alert alert-success">Settings saved! New certificates will use this signature.</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={onSubmit}>

                <div className="mb-4 text-center">
                  <label className="form-label d-block">Admin Signature (used on certificates)</label>
                  <div style={{ height: 100, background: '#f8f9fa', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, border: '1px dashed #ccc' }}>
                    {sigPreview
                      ? <img src={sigPreview} alt="signature" style={{ maxHeight: 80, maxWidth: '90%', objectFit: 'contain' }} />
                      : <span className="text-muted small">No signature uploaded</span>}
                  </div>
                  <label className="btn btn-outline-secondary btn-sm" htmlFor="sig">Upload Signature Image</label>
                  <input id="sig" type="file" accept="image/*" className="d-none" onChange={onSig} />
                  <p className="text-muted small mt-1">Tip: use a transparent PNG of a signature or stamp for best results.</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Admin / Signatory Name</label>
                  <input type="text" className="form-control" value={f.adminName} onChange={e => setF({ ...f, adminName: e.target.value })} placeholder="e.g. Dr. Ahmed Khan" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Designation</label>
                  <input type="text" className="form-control" value={f.adminDesignation} onChange={e => setF({ ...f, adminDesignation: e.target.value })} placeholder="e.g. CEO, EduPak" />
                </div>
                <div className="mb-4">
                  <label className="form-label">Platform Name (shown on certificate header)</label>
                  <input type="text" className="form-control" value={f.platformName} onChange={e => setF({ ...f, platformName: e.target.value })} placeholder="EduPak" />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Save Settings
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
