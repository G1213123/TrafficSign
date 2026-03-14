'use client';

import { useState, useEffect, useRef } from 'react';

// Lazy image component that only sets src when in view
const LazyImage = ({ src, alt, className }) => {
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading when 50px away
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  return (
    <div ref={imgRef} className="sign-image-wrapper">
      {inView ? (
        <img 
          src={src} 
          alt={alt}
          className={className}
        />
      ) : (
        <div className={className} style={{ background: '#f0f0f0' }}></div> // Placeholder
      )}
    </div>
  );
};

export default function SignGallery() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSign, setSelectedSign] = useState(null);

  useEffect(() => {
    fetch('/data/signs.json')
      .then(res => res.json())
      .then(data => {
        // Construct imageUrl here since JSON only has filename and mtime
        const processedSigns = data.map(sign => ({
          ...sign,
          imageUrl: `/api/svg/${sign.filename}?v=${sign.mtime}`
        }));
        setSigns(processedSigns);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load signs:', err);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return <div className="text-center p-4">Loading signs data...</div>;
  }

  return (
    <>
      <div className="gallery-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <p>Total Signs: {signs.length}</p>
         <div className="gallery-controls">
           <button onClick={openRandomSign} className="btn btn-primary">
             Shuffle 🔀
           </button>
         </div>
      </div>

      <div className="catalogue-grid">
        {signs.map((sign) => (
          <div 
            key={sign.filename} 
            className="sign-card"
            onClick={() => openModal(sign)}
          >
            <LazyImage 
              src={sign.imageUrl} 
              alt={`Traffic Sign ${sign.signNumber}`}
              className="sign-image"
            />
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
