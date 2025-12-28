import budiPhoto from '../assets/budi.png';
import sitiPhoto from '../assets/siti.png';
import andiPhoto from '../assets/andi_wijaya.png';
import rinaPhoto from '../assets/rina.png';

export default function Testimoni() {
  const testimonials = [
    {
      name: "Budi Santoso",
      profession: "Freelancer",
      comment: "This platform is very easy to use and secure.",
      rating: 5,
      photo: budiPhoto,
    },
    {
      name: "Siti Aminah",
      profession: "Entrepreneur",
      comment: "Withdrawals are instant, within seconds.",
      rating: 4,
      photo: sitiPhoto,
    },
    {
      name: "Andi Wijaya",
      profession: "Job Seeker",
      comment: "A solution for unemployment like me.",
      rating: 5,
      photo: andiPhoto,
    },
    {
      name: "Rina Putri",
      profession: "Student",
      comment: "Initially I was doubtful, but it turned out to be real. Small investment, returns multiplied.",
      rating: 5,
      photo: rinaPhoto,
    },
  ];

  return (
    <section id="testimoni" className="py-16 bg-sfc-dark-blue relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 fade-element">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-text">What Our Users Say</span>
          </h2>
          <p className="text-lg text-sfc-cream/90 max-w-2xl mx-auto">
            Thousands of users have trusted our platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card fade-element stagger-1">
              <div className="card-inner">
                <div className="card-front">
                  <div className="photo-wrapper">
                    <img src={item.photo} alt={item.name} className="photo" />
                    <div className="photo-ring"></div>
                  </div>
                  <div className="content-wrapper">
                    <h3 className="name">{item.name}</h3>
                    <p className="profession">{item.profession}</p>
                    <div className="rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < item.rating ? 'star active' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="hover-indicator">
                    <span className="indicator-dot"></span>
                    <span className="indicator-text">Hover for details</span>
                  </div>
                </div>
                <div className="card-back">
                  <div className="quote-icon">❝</div>
                  <p className="comment">{item.comment}</p>
                  <div className="quote-icon bottom">❞</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .bg-gradient-text {
          background: linear-gradient(135deg, #DDA853, #F3F3E0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(221, 168, 83, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(221, 168, 83, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .testimonial-card {
          perspective: 1000px;
          height: 400px;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .testimonial-card:hover .card-inner {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(221, 168, 83, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .card-front::before,
        .card-back::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(221, 168, 83, 0.1),
            transparent 70%
          );
          animation: rotate 20s linear infinite;
        }

        .card-back {
          transform: rotateY(180deg);
          background: linear-gradient(
            145deg,
            rgba(221, 168, 83, 0.25),
            rgba(39, 84, 138, 0.2)
          );
          padding: 2.5rem;
          position: relative;
        }

        .card-back::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(245, 196, 94, 0.15) 0%,
            rgba(221, 168, 83, 0.1) 50%,
            rgba(39, 84, 138, 0.15) 100%
          );
          border-radius: 20px;
          pointer-events: none;
        }

        .photo-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: 1.5rem;
        }

        .photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(221, 168, 83, 0.3);
        }

        .photo-ring {
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 2px solid rgba(221, 168, 83, 0.2);
          animation: pulse 2s infinite;
        }

        .content-wrapper {
          text-align: center;
          z-index: 1;
        }

        .name {
          font-size: 1.5rem;
          font-weight: 600;
          color: #F3F3E0;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #DDA853, #F3F3E0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .profession {
          color: rgba(243, 243, 224, 0.7);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .rating {
          display: flex;
          gap: 0.3rem;
          margin-bottom: 1rem;
        }

        .star {
          color: rgba(221, 168, 83, 0.3);
          transition: color 0.3s ease;
        }

        .star.active {
          color: #DDA853;
        }

        .hover-indicator {
          position: absolute;
          bottom: 1rem;
          left: 0;
          right: 0;
          text-align: center;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .indicator-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #DDA853;
          border-radius: 50%;
          margin-right: 0.5rem;
          animation: blink 1s infinite;
        }

        .indicator-text {
          font-size: 0.8rem;
          color: rgba(243, 243, 224, 0.6);
        }

        .quote-icon {
          font-size: 3.5rem;
          color: #F5C45E;
          position: absolute;
          opacity: 0.4;
          z-index: 0;
        }

        .quote-icon:not(.bottom) {
          top: 1rem;
          left: 1rem;
        }

        .quote-icon.bottom {
          top: auto;
          left: auto;
          bottom: 1rem;
          right: 1rem;
        }

        .comment {
          text-align: center;
          font-size: 1.1rem;
          line-height: 1.8;
          color: #F3F3E0;
          max-width: 80%;
          margin: 0 auto;
          font-weight: 500;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(26, 26, 46, 0.5);
          padding: 1.5rem;
          background: rgba(26, 26, 46, 0.6);
          border-left: 4px solid #F5C45E;
          border-radius: 8px;
          backdrop-filter: blur(5px);
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes blink {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }

        @media (max-width: 768px) {
          .testimonial-card {
            height: 350px;
          }
          
          .photo-wrapper {
            width: 100px;
            height: 100px;
          }

          .name {
            font-size: 1.2rem;
          }

          .comment {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}