import React from 'react';

function Home() {
  return (
     <div className="container my-5">
      <h1 className="mb-4 text-center">Welcome to Our App</h1>
      <div className="row g-4 justify-content-center">

        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <img
              src="https://source.unsplash.com/600x400/?technology"
              className="card-img-top"
              alt="Technology"
            />
            <div className="card-body">
              <h5 className="card-title">Cutting-edge Tech</h5>
              <p className="card-text">
                Explore the latest technology trends and innovations tailored to your needs.
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">AI-powered features</li>
              <li className="list-group-item">Real-time updates</li>
              <li className="list-group-item">Secure & Reliable</li>
            </ul>
            <div className="card-body">
              <a href="#register" className="card-link btn btn-primary">
                Get Started
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <img
              src="https://source.unsplash.com/600x400/?community"
              className="card-img-top"
              alt="Community"
            />
            <div className="card-body">
              <h5 className="card-title">Community Driven</h5>
              <p className="card-text">
                Join a vibrant community that supports and grows with you.
              </p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Connect with peers</li>
              <li className="list-group-item">Collaborate & share ideas</li>
              <li className="list-group-item">Events & workshops</li>
            </ul>
            <div className="card-body">
              <a href="#features" className="card-link btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
