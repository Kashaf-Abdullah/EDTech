import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';

export default function CertificateView() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');
  const certRef = useRef(null);

  useEffect(() => {
    API.get(`/certificates/${certId}`)
      .then(r => setCert(r.data.certificate))
      .catch(() => setError('Certificate not found or invalid.'));
  }, [certId]);

  const downloadPDF = async () => {
    // Lazy-load html2canvas + jsPDF from CDN only when needed (keeps bundle small)
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${cert.certificateId}.pdf`);
  };

  if (error) return <div className="container py-5 text-center text-muted"><h5>{error}</h5></div>;
  if (!cert) return <div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-center gap-2 mb-4">
        <button className="btn btn-primary" onClick={downloadPDF}>📥 Download PDF</button>
        <button className="btn btn-outline-secondary" onClick={() => window.print()}>🖨️ Print</button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
        >🔗 Copy share link</button>
      </div>

      {/* The certificate itself */}
      <div className="d-flex justify-content-center">
        <div
          ref={certRef}
          style={{
            width: 900, height: 636, position: 'relative',
            background: '#ffffff',
            border: '10px solid #1f3a5f',
            padding: '50px 60px',
            boxSizing: 'border-box',
            fontFamily: 'Georgia, serif',
          }}
        >
          {/* corner accents */}
          <div style={{ position:'absolute', top:0, left:0, width:0, height:0, borderTop:'90px solid #f0a93c', borderRight:'90px solid transparent' }} />
          <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderTop:'90px solid #1f3a5f', borderLeft:'90px solid transparent' }} />
          <div style={{ position:'absolute', bottom:0, left:0, width:0, height:0, borderBottom:'70px solid #1f3a5f', borderRight:'70px solid transparent' }} />
          <div style={{ position:'absolute', bottom:0, right:0, width:0, height:0, borderBottom:'70px solid #f0a93c', borderLeft:'70px solid transparent' }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <p style={{ letterSpacing: 4, color: '#1f3a5f', fontSize: 13, marginBottom: 4, fontWeight: 700 }}>
              {(cert.platformName || 'EDUPAK').toUpperCase()}
            </p>
            <h1 style={{ fontSize: 38, color: '#1f3a5f', margin: '0 0 4px', letterSpacing: 2 }}>
              CERTIFICATE
            </h1>
            <p style={{ fontSize: 14, color: '#f0a93c', letterSpacing: 6, fontWeight: 700, margin: 0 }}>
              OF COMPLETION
            </p>

            <p style={{ marginTop: 36, fontSize: 13, color: '#555' }}>This certificate is proudly presented to</p>

            <h2 style={{
              fontFamily: "'Brush Script MT', cursive",
              fontSize: 46, color: '#1f3a5f', margin: '10px 0 4px',
              borderBottom: '2px solid #f0a93c', display: 'inline-block', paddingBottom: 6,
            }}>
              {cert.studentName}
            </h2>

            <p style={{ marginTop: 26, fontSize: 14, color: '#444', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              for successfully completing the course
              <br />
              <strong style={{ color: '#1f3a5f', fontSize: 17 }}>"{cert.courseTitle}"</strong>
              <br />
              under the guidance of <strong>{cert.tutorName}</strong>
            </p>

            <p style={{ marginTop: 14, fontSize: 12, color: '#888' }}>
              Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>

          {/* Signature + cert id row */}
          <div style={{
            position: 'absolute', bottom: 55, left: 80, right: 80,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          }}>
            <div style={{ textAlign: 'center', width: 200 }}>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{cert.certificateId}</div>
              <div style={{ borderTop: '1px solid #999', marginTop: 4, paddingTop: 4, fontSize: 11, color: '#777' }}>
                Certificate ID
              </div>
            </div>

            <div style={{ textAlign: 'center', width: 220 }}>
              {cert.adminSignature ? (
                <img src={cert.adminSignature} alt="signature" style={{ height: 50, objectFit: 'contain', marginBottom: 2 }} />
              ) : (
                <div style={{ height: 50 }} />
              )}
              <div style={{ borderTop: '1px solid #1f3a5f', paddingTop: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1f3a5f' }}>{cert.adminName}</div>
                <div style={{ fontSize: 11, color: '#777' }}>{cert.adminDesignation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-muted small mt-3">
        Verify this certificate anytime by sharing this page's link.
      </p>
    </div>
  );
}
