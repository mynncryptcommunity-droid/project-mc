import React, { useState } from 'react';
import { FaDownload, FaUpload, FaBookOpen } from 'react-icons/fa';

// Dummy data for UI prototyping
const dummyEbooks = [
  {
    id: 1,
    title: 'Smart Contract Revolution',
    description: 'Panduan lengkap memahami smart contract dan blockchain masa depan.',
    cover: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    url: '#',
  },
  {
    id: 2,
    title: 'DeFi & Web3 Mastery',
    description: 'Eksplorasi dunia DeFi dan Web3 secara praktis dan aplikatif.',
    cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    url: '#',
  },
  {
    id: 3,
    title: 'Futuristic Finance',
    description: 'Bagaimana teknologi blockchain mengubah masa depan keuangan.',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    url: '#',
  },
];

export default function Ebook() {
  const [ebooks, setEbooks] = useState(dummyEbooks);
  const [showUpload, setShowUpload] = useState(false);

  // Placeholder upload handler
  const handleUpload = (e) => {
    alert('Fitur upload akan diintegrasikan dengan storage!');
    setShowUpload(false);
  };

  return (
    <div className="ebook-section">
      <div className="ebook-header">
        <h2><FaBookOpen style={{ marginRight: 8 }}/> eBook Library</h2>
        <button className="upload-btn" onClick={() => setShowUpload(true)}>
          <FaUpload style={{ marginRight: 6 }}/> Upload eBook
        </button>
      </div>
      <div className="ebook-grid">
        {ebooks.map(ebook => (
          <div key={ebook.id} className="ebook-card">
            <div className="ebook-cover-wrapper">
              <img src={ebook.cover} alt={ebook.title} className="ebook-cover" />
              <div className="ebook-cover-glass" />
            </div>
            <div className="ebook-info">
              <h3>{ebook.title}</h3>
              <p>{ebook.description}</p>
              <div className="ebook-actions">
                <a href={ebook.url} download className="download-btn">
                  <FaDownload /> Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal-upload">
            <h3>Upload eBook Baru</h3>
            <input type="file" accept=".pdf,.epub" />
            <button className="btn" onClick={handleUpload}>Upload</button>
            <button className="btn btn-cancel" onClick={() => setShowUpload(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Styles */}
      <style jsx>{`
        .ebook-section {
          background: linear-gradient(135deg, #232a36 60%, #2d3651 100%);
          border-radius: 32px;
          padding: 32px 24px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          margin: 40px auto;
          max-width: 1100px;
        }
        .ebook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .ebook-header h2 {
          font-size: 2rem;
          color: #F5C45E;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
        }
        .upload-btn {
          background: linear-gradient(90deg, #DDA853 0%, #3B5998 100%);
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 16px;
          padding: 12px 28px;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(221,168,83,0.18);
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: background 0.3s;
        }
        .upload-btn:hover {
          background: linear-gradient(90deg, #3B5998 0%, #DDA853 100%);
          color: #F5C45E;
        }
        .ebook-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 32px;
        }
        .ebook-card {
          background: rgba(36, 44, 68, 0.82);
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(245,196,94,0.07), 0 1.5px 3px #0002;
          overflow: hidden;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ebook-card:hover {
          transform: translateY(-8px) scale(1.04);
          box-shadow: 0 8px 32px 0 #f5c45e33, 0 2px 8px #0002;
        }
        .ebook-cover-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        .ebook-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0 0 24px 24px;
        }
        .ebook-cover-glass {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(245,196,94,0.06);
          backdrop-filter: blur(2.5px);
        }
        .ebook-info {
          padding: 20px 18px 16px 18px;
        }
        .ebook-info h3 {
          margin: 0 0 8px 0;
          color: #F5C45E;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .ebook-info p {
          color: #e6e6e6;
          font-size: 0.98rem;
          margin-bottom: 16px;
        }
        .ebook-actions {
          display: flex;
          gap: 14px;
        }
        .download-btn {
          background: linear-gradient(90deg, #3B5998 0%, #DDA853 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 8px 18px;
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 0.96rem;
          cursor: pointer;
          box-shadow: 0 2px 8px #f5c45e11;
          transition: background 0.3s, color 0.3s;
          gap: 7px;
        }
        .download-btn:hover {
          background: linear-gradient(90deg, #DDA853 0%, #3B5998 100%);
          color: #F5C45E;
        }
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(20, 20, 30, 0.55);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-upload {
          background: #222b3a;
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 #f5c45e33;
          padding: 36px 32px 28px 32px;
          min-width: 320px;
          max-width: 95vw;
          color: #fff;
          text-align: center;
        }
        .modal-upload h3 {
          color: #F5C45E;
          margin-bottom: 18px;
        }
        .modal-upload input[type="file"] {
          margin-bottom: 18px;
          background: #232a36;
          color: #fff;
          border: 1px solid #F5C45E;
          border-radius: 8px;
          padding: 8px;
          width: 100%;
        }
        .btn {
          background: linear-gradient(90deg, #DDA853 0%, #3B5998 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 8px 22px;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px #f5c45e11;
          transition: background 0.3s, color 0.3s;
        }
        .btn-cancel {
          background: #2d3651;
          color: #F5C45E;
        }
        .btn:hover {
          background: linear-gradient(90deg, #3B5998 0%, #DDA853 100%);
          color: #F5C45E;
        }
        @media (max-width: 700px) {
          .ebook-section {
            padding: 16px 4px;
            border-radius: 16px;
          }
          .ebook-header h2 {
            font-size: 1.2rem;
          }
          .ebook-grid {
            gap: 16px;
          }
          .ebook-card {
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
}
