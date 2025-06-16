import React, { useEffect } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';

import usImg from '../assets/us.png';
import dashboardImg from '../assets/Dashboard.png';
import adminImg from '../assets/admin.png';

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="container mt-5 pt-5">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary" data-aos="fade-down">
          👋 Welcome to <span className="text-dark">Sajilo Hajiri</span>
        </h1>
        <p className="lead text-muted" data-aos="fade-up" data-aos-delay="300">
          A smart, AI-powered student attendance system for modern schools and colleges.
        </p>
      </div>

      {/* Cards Section */}
      <div className="row g-4 justify-content-center">

        {/* About Us */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-lg border-0" data-aos="zoom-in">
            <img src={usImg} className="card-img-top" alt="About Us" />
            <div className="card-body">
              <h5 className="card-title text-primary fw-bold">📖 About Us</h5>
              <p className="card-text">
                We’re a passionate team building intelligent tools to simplify school management and bring automation to classrooms.
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Founded by student developers</li>
              <li className="list-group-item">Focused on AI + Education</li>
              <li className="list-group-item">Driven by community impact</li>
            </ul>
            <div className="card-body text-center">
              <a href="#about" className="btn btn-primary w-100">Read Our Story</a>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-lg border-0" data-aos="zoom-in" data-aos-delay="200">
            <img src={dashboardImg} className="card-img-top" alt="Dashboard" />
            <div className="card-body">
              <h5 className="card-title text-success fw-bold">📊 Personal Dashboard</h5>
              <p className="card-text">
                Visualize your attendance summary with charts, daily reports, full history logs, and exportable PDFs.
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Daily attendance reports</li>
              <li className="list-group-item">Complete attendance history</li>
              <li className="list-group-item">Downloadable PDF reports</li>
            </ul>
            <div className="card-body text-center">
              <a href="/dashboard" className="btn btn-outline-success w-100">View Dashboard 📈</a>
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-lg border-0" data-aos="zoom-in" data-aos-delay="400">
            <img src={adminImg} className="card-img-top" alt="Admin Panel" />
            <div className="card-body">
              <h5 className="card-title text-danger fw-bold">🛠 Admin Panel</h5>
              <p className="card-text">
                Simple tools to manage students, monitor status, and generate quick reports.
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Quick student management</li>
              <li className="list-group-item">Real-time status overview</li>
              <li className="list-group-item">Basic filtering tools</li>
            </ul>
            <div className="card-body text-center">
              <a href="/admin" className="btn btn-danger w-100">Admin Panel 🔐</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
