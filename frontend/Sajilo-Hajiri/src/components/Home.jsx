import React, { useEffect } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { 
  FaCheckCircle, 
  FaArrowRight, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaChartLine,
  FaClock,
  FaUsers,
  FaChartBar,
  FaUserTie,
  FaUniversity
} from 'react-icons/fa';

function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  const features = [
    {
      icon: <FaClock className="text-primary" size={32} />,
      title: "Real-time Tracking",
      description: "Monitor attendance as it happens with our live tracking system"
    },
    {
      icon: <FaUsers className="text-primary" size={32} />,
      title: "Student Focused",
      description: "Designed with student needs and privacy in mind"
    },
    {
      icon: <FaChartBar className="text-primary" size={32} />,
      title: "Detailed Analytics",
      description: "Get comprehensive reports and attendance trends"
    }
  ];

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden bg-light">
        <div className="container py-8 py-lg-10">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
              <h1 className="display-3 fw-bold mb-4">
                <span className="text-primary">Sajilo Hajiri</span> Attendance System
              </h1>
              <p className="lead text-muted mb-5">
                AI-powered attendance system that saves time, reduces errors, and provides actionable insights for educators.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a 
                  href="#features" 
                  className="btn btn-primary btn-lg px-4 py-3 rounded-pill shadow-sm d-flex align-items-center"
                >
                  Explore Features <FaArrowRight className="ms-2" />
                </a>
                <a 
                  href="#contact" 
                  className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill d-flex align-items-center"
                >
                  Request Demo
                </a>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="hero-icon-container bg-primary-soft p-5 rounded-4 text-center">
                <FaUniversity className="text-primary" size={120} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-8 bg-light">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Powerful Features</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              Designed to simplify attendance management while providing powerful insights
            </p>
          </div>

          <div className="row g-4 mb-7">
            {features.map((feature, index) => (
              <div className="col-md-4" key={index} data-aos="fade-up" data-aos-delay={index * 150}>
                <div className="feature-card h-100 p-5 bg-white rounded-4 shadow-sm">
                  <div className="icon-container bg-primary-soft rounded-3 mb-4 p-3">
                    {feature.icon}
                  </div>
                  <h4 className="mb-3">{feature.title}</h4>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="p-5 bg-white rounded-4 shadow-sm text-center">
                <FaUserTie className="text-primary mb-4" size={80} />
                <h4 className="mb-3">AI-Powered Recognition</h4>
                <p className="text-muted">
                  Advanced technology identifies students instantly with industry-leading accuracy
                </p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <h3 className="fw-bold mb-4">Smart Attendance Tracking</h3>
              <p className="text-muted mb-4">
                Our system automatically records attendance without manual input, saving valuable class time.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex">
                  <FaCheckCircle className="text-primary mt-1 me-3" />
                  <span>Works in various lighting conditions</span>
                </li>
                <li className="mb-3 d-flex">
                  <FaCheckCircle className="text-primary mt-1 me-3" />
                  <span>Adapts to appearance changes</span>
                </li>
                <li className="mb-3 d-flex">
                  <FaCheckCircle className="text-primary mt-1 me-3" />
                  <span>Privacy-focused design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              Simple three-step process for effortless attendance management
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="step-card text-center p-4 bg-light rounded-4 h-100">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-4">1</div>
                <h4 className="mb-3">Setup</h4>
                <p className="text-muted mb-0">
                  Register students and teachers through our simple onboarding process
                </p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="step-card text-center p-4 bg-light rounded-4 h-100">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-4">2</div>
                <h4 className="mb-3">Attendance</h4>
                <p className="text-muted mb-0">
                  Students simply walk in front of the camera to be automatically recognized
                </p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="step-card text-center p-4 bg-light rounded-4 h-100">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-4">3</div>
                <h4 className="mb-3">Reports</h4>
                <p className="text-muted mb-0">
                  Access detailed attendance reports and analytics in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 bg-light">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Trusted by Educators</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              What our users say about Sajilo Hajiri
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="testimonial-card p-5 bg-white rounded-4 shadow-sm h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="avatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <span>JD</span>
                  </div>
                  <div>
                    <h5 className="mb-1">Mahesh Neupane</h5>
                    <p className="text-muted small mb-0">HOD-IT, NCIT College</p>
                  </div>
                </div>
                <p className="mb-0">
                  "Sajilo Hajiri has transformed our attendance system. What used to take 15 minutes per class now happens automatically."
                </p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="150">
              <div className="testimonial-card p-5 bg-white rounded-4 shadow-sm h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="avatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                    <span>AS</span>
                  </div>
                  <div>
                    <h5 className="mb-1">Bhusan Thapa</h5>
                    <p className="text-muted small mb-0">Professor, NCIT College</p>
                  </div>
                </div>
                <p className="mb-0">
                  "The analytics dashboard provides insights I never had before. I can now track attendance patterns easily."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-primary text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8" data-aos="fade-up">
              <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Attendance System?</h2>
              <p className="lead mb-5 opacity-75">
                Join hundreds of educational institutions using Sajilo Hajiri
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <a href="/register" className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow-sm">
                  Get Started Now
                </a>
                <a href="/demo" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill">
                  Request Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;