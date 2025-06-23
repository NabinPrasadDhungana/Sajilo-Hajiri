import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture';

const Register = (props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('student');
  const [collegeRoll, setCollegeRoll] = useState('');
  const [semesterError, setSemesterError] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [collegeRollError, setCollegeRollError] = useState('');
  const [message, setMessage] = useState('');

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    setFullNameError('');
    setError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setError('');
  };

  const handleSemesterChange = (e) => {
    setSemester(e.target.value);
    setSemesterError('');
    setError('');
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
    setSectionError('');
    setError('');
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setDepartmentError('');
    setError('');
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setRoleError('');
    setError('');
  };

  const handleCollegeRollChange = (e) => {
    setCollegeRoll(e.target.value);
    setCollegeRollError('');
    setError('');
  };

  const handlePhotoCapture = (image) => {
    setPhoto(image);
    setIsWebcamOpen(false);
    setError('');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
  // Validations (unchanged)
  if (fullName.trim() === '') {
    setFullNameError('Full Name is required.');
    setError('Please fill in all required fields.');
    return;
  }
  if (!isValidEmail(email)) {
    setEmailError('Please enter a valid email address.');
    setError('Please fill in all required fields.');
    return;
  }
  if (semester.trim() === '') {
    setSemesterError('Semester is required.');
    setError('Please fill in all required fields.');
    return;
  }
  if (section.trim() === '') {
    setSectionError('Section is required.');
    setError('Please fill in all required fields.');
    return;
  }
  if (department.trim() === '') {
    setDepartmentError('Department is required.');
    setError('Please fill in all required fields.');
    return;
  }
  if (role.trim() === '') {
    setRoleError('Role is required.');
    setError('Please fill in all required fields.');
    return;
  }
  if (role === 'student' && collegeRoll.trim() === '') {
    setCollegeRollError('College Roll Number is required for students.');
    setError('Please fill in all required fields.');
    return;
  }
  if (!photo) {
    setError('Please upload or capture a photo.');
    return;
  }

  setError('');

  try {
    const formData = new FormData();
    formData.append('name', fullName);
    formData.append('email', email);
    formData.append('username', email); // assuming username is email
    formData.append('password', 'temporary123'); // or generate a password
    formData.append('role', role);
    if (role === 'student') {
      formData.append('roll_number', collegeRoll);
    }

    // Convert base64 image to file
    const blob = await (await fetch(photo)).blob();
    const filename = `photo_${Date.now()}.jpg`;
    const file = new File([blob], filename, { type: blob.type });
    formData.append('avatar', file);

    // Send request
    const res = await fetch('http://127.0.0.1:8000/api/register/', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('✅ User registered successfully and is pending approval');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500); // Delay for user to see message

    } else {
      setError(data?.error || 'Registration failed. Check fields or try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    setError('Something went wrong. Please try again later.');
  }
};


  return (
    <div className="total" style={{ marginLeft: '10px' }}>
      <form>
        {/* Email */}
        <div className="my-4">
          <label htmlFor="emailInput" className="form-label" style={{ marginTop: '80px' }}>
            Email address
          </label>
          <input
            type="email"
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            id="emailInput"
            onChange={handleEmailChange}
            required
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>

        {/* Full Name */}
        <div className="my-3">
          <label htmlFor="fullNameInput" className="form-label">Full Name</label>
          <input
            type="text"
            className={`form-control ${fullNameError ? 'is-invalid' : ''}`}
            id="fullNameInput"
            onChange={handleFullNameChange}
            required
            style={{
              backgroundColor: props.mode === 'dark' ? 'black' : 'white',
              color: props.mode === 'dark' ? 'white' : 'black',
            }}
          />
          {fullNameError && <div className="invalid-feedback">{fullNameError}</div>}
        </div>

        {/* Semester */}
        <div className="my-3">
          <label className="form-label">Semester</label>
          <select
            className={`form-select ${semesterError ? 'is-invalid' : ''}`}
            value={semester}
            onChange={handleSemesterChange}
          >
            <option value="">Select Semester</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={`Semester ${i + 1}`}>Semester {i + 1}</option>
            ))}
          </select>
          {semesterError && <div className="invalid-feedback">{semesterError}</div>}
        </div>

        {/* Section */}
        <div className="my-3">
          <label className="form-label">Section</label>
          <select
            className={`form-select ${sectionError ? 'is-invalid' : ''}`}
            value={section}
            onChange={handleSectionChange}
          >
            <option value="">Select Section</option>
            <option value="Morning">Morning</option>
            <option value="Day">Day</option>
          </select>
          {sectionError && <div className="invalid-feedback">{sectionError}</div>}
        </div>

        {/* Department */}
        <div className="my-3">
          <label className="form-label">Department</label>
          <select
            className={`form-select ${departmentError ? 'is-invalid' : ''}`}
            value={department}
            onChange={handleDepartmentChange}
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="CE">CE</option>
            <option value="SE">SE</option>
            <option value="BCA">BCA</option>
            <option value="CIVIL">CIVIL</option>
            <option value="BEEE">BEEE</option>
          </select>
          {departmentError && <div className="invalid-feedback">{departmentError}</div>}
        </div>

        {/* Role */}
        <div className="my-3">
          <label htmlFor="roleSelect" className="form-label">Role</label>
          <select
            id="roleSelect"
            className={`form-select ${roleError ? 'is-invalid' : ''}`}
            value={role}
            onChange={handleRoleChange}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {roleError && <div className="invalid-feedback">{roleError}</div>}
        </div>

        {/* College Roll Number – Only for Students */}
        {role === 'student' && (
          <div className="my-3">
            <label htmlFor="collegeRollInput" className="form-label">College Roll Number</label>
            <input
              type="text"
              className={`form-control ${collegeRollError ? 'is-invalid' : ''}`}
              id="collegeRollInput"
              onChange={handleCollegeRollChange}
              required
              placeholder="e.g., 221506"
            />
            {collegeRollError && <div className="invalid-feedback">{collegeRollError}</div>}
          </div>
        )}

        {/* Photo Upload or Webcam Capture */}
        <div className="my-4">
          <label className="form-label fw-bold">Upload or Capture Photo</label>

          <div className="mb-3">
            <button
              type="button"
              className={`btn ${!isWebcamOpen ? 'btn-outline-primary' : 'btn-secondary'} me-2`}
              onClick={() => setIsWebcamOpen(false)}
              disabled={!!photo}
            >
              📁 Upload from Device
            </button>
            <button
              type="button"
              className={`btn ${isWebcamOpen ? 'btn-outline-success' : 'btn-secondary'}`}
              onClick={() => setIsWebcamOpen(true)}
              disabled={!!photo}
            >
              📷 Capture with Camera
            </button>
          </div>

          {!isWebcamOpen && !photo && (
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPhoto(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div className="form-text">Accepted formats: .jpg, .png, .jpeg</div>
            </div>
          )}

          {isWebcamOpen && !photo && (
            <div className="mb-3">
              <WebcamCapture onCapture={handlePhotoCapture} />
            </div>
          )}

          {photo && (
            <div className="text-center">
              <h6>🖼️ Your Photo:</h6>
              <img
                src={photo}
                alt="Uploaded"
                style={{
                  maxWidth: '150px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              />
              <br />
              <button
                type="button"
                className="btn btn-sm btn-danger mt-2"
                onClick={() => {
                  if (window.confirm("Remove this photo?")) {
                    setPhoto(null);
                  }
                }}
              >
                ❌ Remove
              </button>
            </div>
          )}
        </div>

        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
        {message && <div className="alert alert-success mt-3">{message}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default Register;
