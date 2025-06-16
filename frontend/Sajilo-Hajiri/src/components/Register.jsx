import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture';

const Register = (props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photos, setPhotos] = useState([]);
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
    setPhotos((prevPhotos) => [...prevPhotos, image]);
    setIsWebcamOpen(false);
    setError('');
  };

  const removePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
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
      setSemesterError('Semester/Section is required.');
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

    if (collegeRoll.trim() === '') {
      setCollegeRollError('College Roll Number is required.');
      setError('Please fill in all required fields.');
      return;
    }

    if (photos.length === 0) {
      setError('Please capture at least one photo.');
      return;
    }

    // All checks passed, submit form
    setError('');
    props.showAlert("Form Submitted Successfully", "success");

    console.log("Form Data:", {
      fullName,
      email,
      semester,
      department,
      role,
      collegeRoll,
      photos,
    });

    // Here you can add your form submission logic (e.g., send to backend)
  };

  return (
    <div className="total" style={{
            marginLeft: '10px',
          }}>
    <form>
      {/* Email */}
      <div className="my-4">
        <label
          htmlFor="emailInput"
          className="form-label"
          style={{
            marginTop: '80px', 
          }}
        >
          Email address
        </label>
        <input
          type="email"
          className={`form-control ${error && !isValidEmail(email) ? 'is-invalid' : ''}`}
          id="emailInput"
          onChange={handleEmailChange}
          required
        />
        {emailError && <div className="invalid-feedback">{emailError}</div>}
      </div>

      {/* Full Name */}
      <div className="my-3">
        <label
          htmlFor="fullNameInput"
          className="form-label"
        >
          Full Name
        </label>
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


      {/* Semester/Section */}
      <div className="my-3">
          <label className="form-label">Semester</label>
          <select
            className={`form-select ${semesterError ? 'is-invalid' : ''}`}
            value={semester}
            onChange={(e) => { setSemester(e.target.value); setSemesterError(''); setError(''); }}
          >
            <option value="">Select Semester</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={`Semester ${i + 1}`}>Semester {i + 1}</option>
            ))}
          </select>
          {semesterError && <div className="invalid-feedback">{semesterError}</div>}
        </div>

        <div className="my-3">
          <label className="form-label">Section</label>
          <select
            className={`form-select ${sectionError ? 'is-invalid' : ''}`}
            value={section}
            onChange={(e) => { setSection(e.target.value); setSectionError(''); setError(''); }}
          >
            <option value="">Select Section</option>
            <option value="Morning">Morning</option>
            <option value="Day">Day</option>
          </select>
          {sectionError && <div className="invalid-feedback">{sectionError}</div>}
        </div>

        <div className="my-3">
          <label className="form-label">Department</label>
          <select
            className={`form-select ${departmentError ? 'is-invalid' : ''}`}
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setDepartmentError(''); setError(''); }}
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

      {/* Role Dropdown */}
      <div className="my-3">
        <label
          htmlFor="roleSelect"
          className="form-label"
        >
          Role
        </label>
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

      {/* College Roll Number */}
      <div className="my-3">
        <label
          htmlFor="collegeRollInput"
          className="form-label"
        >
          College Roll Number
        </label>
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

      {/* Photo Capture */}
      <div className="my-3">
        <label htmlFor="photoInput" className="form-label"></label>
        {!isWebcamOpen ? (
          <>
            <button
              type="button"
              className="btn btn-primary mx-2"
              onClick={() => setIsWebcamOpen(true)}
            >
              Open Webcam And Capture your Photo
            </button>
            {photos.length > 0 && (
              <div>
                <p>
                  Captured Photos:
                </p>
                <div className="d-flex flex-wrap">
                  {photos.map((photo, index) => (
                    <div key={index} className="m-2">
                      <img
                        src={photo}
                        alt={`Captured Pics ${index + 1}`}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                      <button type="button" onClick={() => removePhoto(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <WebcamCapture onCapture={handlePhotoCapture} />
        )}
      </div>

      
      <button type="button" className="btn btn-primary mx-2" onClick={handleSubmit}>
        Submit
      </button>

      {/* Error Message */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </form>
    </div>
  );
};

export default Register;
