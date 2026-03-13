'use client';

import { useState } from 'react';

export default function SignGallery({ signs }) {
  const [selectedSign, setSelectedSign] = useState(null);

  const openModal = (sign) => {
    setSelectedSign(sign);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedSign(null);
    document.body.style.overflow = 'auto';
  };

  const openRandomSign = () => {
    if (signs.length > 0) {
      const randomIndex = Math.floor(Math.random() * signs.length);
      openModal(signs[randomIndex]);
    }
  };

  return (
    <>
      <div className="gallery-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
         <button onClick={openRandomSign} className="btn btn-primary">
           Shuffle 🔀
         </button>
      </div>

      <div className="catalogue-grid">
        {signs.map((sign) => (
          <div 
            key={sign.filename} 
            className="sign-card"
            onClick={() => openModal(sign)}
          >
            <div className="sign-image-wrapper">
              <img 
                src={sign.imageUrl} 
                alt={`Traffic Sign ${sign.signNumber}`}
                className="sign-image"
                loading="lazy"
              />
            </div>
            <div className="sign-info">
              <div className="sign-number">{sign.signNumber}</div>
              <div className="sign-name">{sign.filename}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedSign && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <div className="modal-body">
              <div className="modal-image-container">
                <img 
                  src={selectedSign.imageUrl} 
                  alt={`Traffic Sign ${selectedSign.signNumber}`}
                  className="modal-image"
                />
              </div>
              
              <div className="modal-details">
                <h2 className="modal-title">Traffic Sign {selectedSign.signNumber}</h2>
                <p className="modal-subtitle">{selectedSign.filename}</p>
                
                <div className="modal-info-section">
                  <h3>Description</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  
                  <h3>Reference No.</h3>
                  <p>{selectedSign.signNumber}</p>

                  <h3>External Link</h3>
                  <a href="#" className="modal-link">View Official Documentation</a>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary">Share</button>
                  <button className="btn btn-secondary">Download</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
