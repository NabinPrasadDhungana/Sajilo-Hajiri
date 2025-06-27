import React, { useState, useEffect } from 'react';
import WebcamCapture from './WebcamCapture';
import getCSRFToken from '../Helper/Csrf_token';

const Register = (props) => {
  // Basic Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Role-specific fields
  const [role, setRole] = useState('student');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState('');
  const [collegeRoll, setCollegeRoll] = useState('');

  // Role-specific error states
  const [semesterError, setSemesterError] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [collegeRollError, setCollegeRollError] = useState('');

  const isTeacher = role === 'teacher';

  // Clear student-specific fields when role changes to teacher
  useEffect(() => {
    if (isTeacher) {
      setSemester('');
      setSection('');
      setDepartment('');
      setCollegeRoll('');
      setSemesterError('');
      setSectionError('');
      setDepartmentError('');
      setCollegeRollError('');
    }
  }, [isTeacher]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (pass) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pass);
  };

  const handlePhotoCapture = (image) => {
    setPhoto(image);
    setIsWebcamOpen(false);
    setError('');
  };

  const handleSubmit = async () => {
    const csrfToken = await getCSRFToken();
    let isValid = true;

    // Reset all errors
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setSemesterError('');
    setSectionError('');
    setDepartmentError('');
    setCollegeRollError('');
    setError('');

    // Validate common fields
    if (fullName.trim() === '') {
      setFullNameError('Full Name is required.');
      isValid = false;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    // Validate student-specific fields
    if (!isTeacher) {
      if (semester.trim() === '') {
        setSemesterError('Semester is required.');
        isValid = false;
      }
      if (section.trim() === '') {
        setSectionError('Section is required.');
        isValid = false;
      }
      if (department.trim() === '') {
        setDepartmentError('Department is required.');
        isValid = false;
      }
      if (collegeRoll.trim() === '') {
        setCollegeRollError('College Roll Number is required.');
        isValid = false;
      }
    }

    if (!photo) {
      setError('Please upload or capture a photo.');
      isValid = false;
    }

    if (!isValid) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', email);
    formData.append('name', fullName);
    formData.append('role', role);
    formData.append('password', password);

    if (!isTeacher) {
      formData.append('semester', semester);
      formData.append('section', section);
      formData.append('department', department);
      formData.append('roll_number', collegeRoll);
    }

    // Convert Base64 to Blob
    const blob = await fetch(photo).then(res => res.blob());
    formData.append('avatar', blob, 'photo.jpg');

    try {
      const response = await fetch('/api/register/', {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ User registered successfully and is pending approval');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        console.error(data);
        setError("Registration failed. Please check the inputs.");
      }
    } catch (error) {
      console.error(error);
      setError("Server error occurred.");
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
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); setError(''); }}
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
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setFullNameError(''); setError(''); }}
            required
            style={{
              backgroundColor: props.mode === 'dark' ? 'black' : 'white',
              color: props.mode === 'dark' ? 'white' : 'black',
            }}
          />
          {fullNameError && <div className="invalid-feedback">{fullNameError}</div>}
        </div>

        {/* Password */}
        <div className="my-3">
          <label htmlFor="passwordInput" className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            id="passwordInput"
            value={password}
            onChange={(e) => { 
              setPassword(e.target.value); 
              setPasswordError(''); 
              setError(''); 
            }}
            required
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
          <div className="form-text">
            Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
          </div>
        </div>

        {/* Confirm Password */}
        <div className="my-3">
          <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
          <input
            type="password"
            className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
            id="confirmPasswordInput"
            value={confirmPassword}
            onChange={(e) => { 
              setConfirmPassword(e.target.value); 
              setConfirmPasswordError(''); 
              setError(''); 
            }}
            required
          />
          {confirmPasswordError && <div className="invalid-feedback">{confirmPasswordError}</div>}
        </div>

        {/* Role */}
        <div className="my-3">
          <label htmlFor="roleSelect" className="form-label">Role</label>
          <select
            id="roleSelect"
            className="form-select"
            value={role}
            onChange={(e) => { 
              setRole(e.target.value); 
              setError(''); 
            }}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {/* Student-specific fields */}
        {role === 'student' && (
          <>
            {/* Semester */}
            <div className="my-3">
              <label className="form-label">Semester</label>
              <select
                className={`form-select ${semesterError ? 'is-invalid' : ''}`}
                value={semester}
                onChange={(e) => { 
                  setSemester(e.target.value); 
                  setSemesterError(''); 
                  setError(''); 
                }}
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
                onChange={(e) => { 
                  setSection(e.target.value); 
                  setSectionError(''); 
                  setError(''); 
                }}
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
                onChange={(e) => { 
                  setDepartment(e.target.value); 
                  setDepartmentError(''); 
                  setError(''); 
                }}
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

            {/* College Roll Number */}
            <div className="my-3">
              <label htmlFor="collegeRollInput" className="form-label">College Roll Number</label>
              <input
                type="text"
                className={`form-control ${collegeRollError ? 'is-invalid' : ''}`}
                id="collegeRollInput"
                value={collegeRoll}
                onChange={(e) => { 
                  setCollegeRoll(e.target.value); 
                  setCollegeRollError(''); 
                  setError(''); 
                }}
                required
                placeholder="e.g., 221506"
              />
              {collegeRollError && <div className="invalid-feedback">{collegeRollError}</div>}
            </div>
          </>
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
                    reader.onloadend = () => setPhoto(reader.result);
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
                onClick={() => window.confirm("Remove this photo?") && setPhoto(null)}
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