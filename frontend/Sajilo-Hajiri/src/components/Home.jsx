import React, { useEffect } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import './Home.css';
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
  FaUniversity,
  FaCamera,
  FaShieldAlt,
  FaMobileAlt,
  FaCloud,
  FaDatabase,
  FaPlug,
  FaBook,
  FaVideo,
  FaFileAlt,
  FaHeadset,
  FaGraduationCap,
  FaLaptop,
  FaServer
} from 'react-icons/fa';

function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });

    // Handle hash-based navigation on page load
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            const navbarHeight = 96;
            const targetPosition = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }, 300);
        }
      }
    };

    // Scroll after a short delay to ensure DOM is ready
    setTimeout(handleHashScroll, 100);
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

      {/* Product Section */}
      <section id="product" className="py-8 bg-white">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Our Product</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              A comprehensive AI-powered attendance management system designed for modern educational institutions
            </p>
          </div>

          <div className="row g-5 mb-7">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="product-feature-card p-5 bg-light rounded-4 h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="product-icon-wrapper bg-primary-soft rounded-3 p-3 me-3">
                    <FaCamera className="text-primary" size={40} />
                  </div>
                  <h3 className="mb-0">Face Recognition Technology</h3>
                </div>
                <p className="text-muted mb-4">
                  Our advanced facial recognition system uses cutting-edge AI algorithms to identify students with 99.7% accuracy. The system works seamlessly in various lighting conditions and adapts to appearance changes.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>Real-time face detection and matching</span>
                  </li>
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>Works with standard webcams and cameras</span>
                  </li>
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>Privacy-compliant data handling</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="product-feature-card p-5 bg-light rounded-4 h-100">
                <div className="d-flex align-items-center mb-4">
                  <div className="product-icon-wrapper bg-primary-soft rounded-3 p-3 me-3">
                    <FaShieldAlt className="text-primary" size={40} />
                  </div>
                  <h3 className="mb-0">Security & Privacy</h3>
                </div>
                <p className="text-muted mb-4">
                  Your data security is our top priority. We implement industry-standard encryption, secure authentication, and comply with data protection regulations to keep student information safe.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="mb-2 d-flex align-items-center">
                    <FaCheckCircle className="text-primary me-2" />
                    <span>GDPR and FERPA compliant</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="product-card text-center p-4 bg-white rounded-4 shadow-sm h-100">
                <FaMobileAlt className="text-primary mb-3" size={48} />
                <h4 className="mb-3">Mobile Responsive</h4>
                <p className="text-muted mb-0">
                  Access your attendance system from any device - desktop, tablet, or mobile. Fully responsive design ensures seamless experience across all platforms.
                </p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="product-card text-center p-4 bg-white rounded-4 shadow-sm h-100">
                <FaCloud className="text-primary mb-3" size={48} />
                <h4 className="mb-3">Cloud-Based</h4>
                <p className="text-muted mb-0">
                  All your data is securely stored in the cloud. No need for expensive server infrastructure. Access your data anytime, anywhere.
                </p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="product-card text-center p-4 bg-white rounded-4 shadow-sm h-100">
                <FaDatabase className="text-primary mb-3" size={48} />
                <h4 className="mb-3">Data Analytics</h4>
                <p className="text-muted mb-0">
                  Powerful analytics dashboard provides insights into attendance patterns, trends, and helps identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-8 bg-light">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Solutions for Every Need</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              Tailored solutions designed to meet the unique requirements of different educational institutions
            </p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="solution-card p-5 bg-white rounded-4 shadow-sm h-100">
                <div className="solution-icon mb-4">
                  <FaGraduationCap className="text-primary" size={50} />
                </div>
                <h3 className="mb-3">For Universities</h3>
                <p className="text-muted mb-4">
                  Manage attendance across multiple departments, faculties, and large student populations. Scale effortlessly with our enterprise-grade solution.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Multi-department support
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Bulk student management
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Advanced reporting tools
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="solution-card p-5 bg-white rounded-4 shadow-sm h-100">
                <div className="solution-icon mb-4">
                  <FaLaptop className="text-primary" size={50} />
                </div>
                <h3 className="mb-3">For Colleges</h3>
                <p className="text-muted mb-4">
                  Perfect for mid-sized institutions. Streamline attendance tracking with automated processes and comprehensive analytics.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Class-based organization
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Teacher dashboard
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Student self-service portal
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="solution-card p-5 bg-white rounded-4 shadow-sm h-100">
                <div className="solution-icon mb-4">
                  <FaChalkboardTeacher className="text-primary" size={50} />
                </div>
                <h3 className="mb-3">For Schools</h3>
                <p className="text-muted mb-4">
                  Simple and intuitive solution for primary and secondary schools. Easy setup and management for educators.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Easy student enrollment
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Parent notifications
                  </li>
                  <li className="mb-2">
                    <FaCheckCircle className="text-primary me-2" />
                    Simple interface
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-8 bg-white">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Seamless Integrations</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              Connect Sajilo Hajiri with your existing systems and tools for a unified experience
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="integration-card text-center p-4 bg-light rounded-4 h-100">
                <div className="integration-icon-wrapper mb-3">
                  <FaPlug className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">REST API</h5>
                <p className="text-muted small mb-0">
                  Comprehensive REST API for custom integrations and third-party applications
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="integration-card text-center p-4 bg-light rounded-4 h-100">
                <div className="integration-icon-wrapper mb-3">
                  <FaServer className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">LMS Integration</h5>
                <p className="text-muted small mb-0">
                  Connect with popular Learning Management Systems like Moodle, Canvas, and Blackboard
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="integration-card text-center p-4 bg-light rounded-4 h-100">
                <div className="integration-icon-wrapper mb-3">
                  <FaDatabase className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">Database Export</h5>
                <p className="text-muted small mb-0">
                  Export attendance data in multiple formats: CSV, Excel, PDF for reporting and analysis
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
              <div className="integration-card text-center p-4 bg-light rounded-4 h-100">
                <div className="integration-icon-wrapper mb-3">
                  <FaCloud className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">Cloud Storage</h5>
                <p className="text-muted small mb-0">
                  Sync with Google Drive, Dropbox, and OneDrive for backup and file management
                </p>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-lg-8 mx-auto text-center" data-aos="fade-up">
              <div className="integration-cta p-5 bg-primary-soft rounded-4">
                <h4 className="mb-3">Need a Custom Integration?</h4>
                <p className="text-muted mb-4">
                  Our team can help you integrate Sajilo Hajiri with your existing systems. Contact us to discuss your requirements.
                </p>
                <a href="/register" className="btn btn-primary px-4 py-2 rounded-pill">
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-8 bg-light">
        <div className="container">
          <div className="text-center mb-7" data-aos="fade-up">
            <h2 className="display-5 fw-bold mb-3">Resources & Support</h2>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
              Everything you need to get started and make the most of Sajilo Hajiri
            </p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="resource-card p-4 bg-white rounded-4 shadow-sm h-100 text-center">
                <div className="resource-icon mb-3">
                  <FaBook className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">Documentation</h5>
                <p className="text-muted small mb-3">
                  Comprehensive guides and tutorials to help you set up and use Sajilo Hajiri effectively
                </p>
                <a href="#" className="btn btn-outline-primary btn-sm">View Docs</a>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="resource-card p-4 bg-white rounded-4 shadow-sm h-100 text-center">
                <div className="resource-icon mb-3">
                  <FaVideo className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">Video Tutorials</h5>
                <p className="text-muted small mb-3">
                  Step-by-step video guides covering all features and common use cases
                </p>
                <a href="#" className="btn btn-outline-primary btn-sm">Watch Videos</a>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="resource-card p-4 bg-white rounded-4 shadow-sm h-100 text-center">
                <div className="resource-icon mb-3">
                  <FaFileAlt className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">FAQs</h5>
                <p className="text-muted small mb-3">
                  Find answers to frequently asked questions about features, setup, and troubleshooting
                </p>
                <a href="#" className="btn btn-outline-primary btn-sm">Browse FAQs</a>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
              <div className="resource-card p-4 bg-white rounded-4 shadow-sm h-100 text-center">
                <div className="resource-icon mb-3">
                  <FaHeadset className="text-primary" size={40} />
                </div>
                <h5 className="mb-3">Support</h5>
                <p className="text-muted small mb-3">
                  Get help from our support team via email, chat, or phone. We're here to assist you 24/7
                </p>
                <a href="#" className="btn btn-outline-primary btn-sm">Contact Support</a>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-10 mx-auto" data-aos="fade-up">
              <div className="resource-banner p-5 bg-white rounded-4 shadow-sm">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="mb-3">Get Started Today</h4>
                    <p className="text-muted mb-0">
                      Join hundreds of educational institutions already using Sajilo Hajiri. Start your free trial today and experience the future of attendance management.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <a href="/register" className="btn btn-primary btn-lg px-4 py-3 rounded-pill">
                      Start Free Trial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 bg-white">
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
      <section className="py-8 bg-primary text-white" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8" data-aos="fade-up">
              <h2 className="display-5 fw-bold mb-4" style={{ color: 'white' }}>Ready to Transform Your Attendance System?</h2>
              <p className="lead mb-5" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.25rem' }}>
                Join hundreds of educational institutions using Sajilo Hajiri
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <a href="/register" className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow-sm" style={{ fontWeight: '600' }}>
                  Get Started Now
                </a>
                <a href="/demo" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill" style={{ fontWeight: '600' }}>
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