import React, { useEffect } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';

import usImg from '../assets/us.png';

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(120deg, #e0f7fa, #f1f8ff)' }}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-6 text-center mb-4 mb-md-0" data-aos="fade-right">
              <img
                src={usImg}
                alt="About Us"
                className="img-fluid rounded-4 shadow-sm"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <h1 className="display-4 fw-bold text-primary">
                👋 Welcome to <span className="text-dark">Sajilo Hajiri</span>
              </h1>
              <p className="lead text-muted mt-3">
                A smart, AI-powered student attendance system for modern schools and colleges.
              </p>
              <a href="#about" className="btn btn-primary mt-4 px-4 py-2 rounded-pill shadow">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-4" data-aos="fade-up">
            <h2 className="fw-bold text-primary mb-3">📖 About Us</h2>
            <p className="text-muted fs-5">
              We are Sajilo Hajiri — a family of passionate student developers dedicated to bringing innovation into classrooms.
              Our mission is to modernize attendance with the power of AI and simplify school management for both students and teachers.
            </p>
            <p className="text-muted fs-5 mt-3">
              Our system is designed to be <strong>simple, efficient, and effective</strong>. We understand the challenges of traditional attendance systems, which is why we built a solution that works seamlessly in the background.
              <br />
              We provide an <strong>online attendance system</strong> using webcams. The system automatically detects when a student arrives, tracks when they leave, and calculates the total duration of their presence — all in real-time.
            </p>
          </div>
          <div className="row justify-content-center" data-aos="fade-up" data-aos-delay="200">
            <div className="col-md-8">
              <ul className="list-unstyled fs-5">
                <li className="mb-3">✅ Founded by student developers</li>
                <li className="mb-3">✅ Focused on AI + Education</li>
                <li className="mb-3">✅ Driven by community impact</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
