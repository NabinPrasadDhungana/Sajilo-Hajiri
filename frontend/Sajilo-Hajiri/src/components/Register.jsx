import React, { useState, useEffect } from 'react';
import WebcamCapture from './WebcamCapture';
import { authFetch } from '../Helper/Csrf_token';
import { Navigate, useNavigate } from 'react-router-dom';

const Register = (props) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    semester: '',
    section: '',
    department: '',
    collegeRoll: ''
  });

  const [photo, setPhoto] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/csrf/', { credentials: 'include' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    if (formData.role === 'teacher') {
      setFormData(prev => ({
        ...prev,
        semester: '',
        section: '',
        department: '',
        collegeRoll: ''
      }));
      setErrors(prev => ({
        ...prev,
        semester: '',
        section: '',
        department: '',
        collegeRoll: ''
      }));
    }
  }, [formData.role]);

  useEffect(() => {
    const loadUserDataIfEdit = async () => {
      if (props.editMode) {
        const res = await authFetch("/api/pending-self-info/", {
          method: "GET",
          credentials: "include"
        });
        if (res.ok) {
          const userData = await res.json();
          setFormData({
            fullName: userData.name || '',
            email: userData.email || '',
            password: '',
            confirmPassword: '',
            role: userData.role || 'student',
            semester: userData.semester || '',
            section: userData.section || '',
            department: userData.department || '',
            collegeRoll: userData.roll_number || ''
          });
          if (userData.avatar) {
            setPhoto(`http://localhost:8000${userData.avatar}`);
          }
        }
      }
    };

    loadUserDataIfEdit();
  }, [props.editMode]);

  const validateForm = () => {
  const newErrors = {};
  const { fullName, email, password, confirmPassword, role } = formData;

  // Common validations
  if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
  
  // Fixed password regex
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password)) {
    newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&#)';
  }
  
  if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
  if (!photo) newErrors.photo = 'Please upload or capture a photo';

  // Student-specific validations
  if (role === 'student') {
    const { semester, section, department, collegeRoll } = formData;
    if (!semester) newErrors.semester = 'Semester is required';
    if (!section) newErrors.section = 'Section is required';
    if (!department) newErrors.department = 'Department is required';
    if (!collegeRoll) newErrors.collegeRoll = 'Roll number is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const handlePhotoCapture = (image) => {
    setPhoto(image);
    setIsWebcamOpen(false);
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const isPendingUser = user && user.approval_status === "pending";

    try {
      const formPayload = new FormData();
      formPayload.append('email', formData.email);
      formPayload.append('username', formData.email);
      formPayload.append('name', formData.fullName);
      formPayload.append('role', formData.role);
      formPayload.append('password', formData.password);

      if (formData.role === 'student') {
        formPayload.append('semester', formData.semester);
        formPayload.append('section', formData.section);
        formPayload.append('department', formData.department);
        formPayload.append('roll_number', formData.collegeRoll);
      }

      const blob = await fetch(photo).then(res => res.blob());
      formPayload.append('avatar', blob, 'photo.jpg');

      const endpoint = isPendingUser ? '/api/update-info/' : '/api/register/';
      const response = await authFetch(endpoint, {
        method: 'POST',
        body: formPayload,
      });

      const data = await response.json();

      if (response.ok) {
        if (isPendingUser) {
          setMessage('✅ Your information was updated successfully.');
          setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
          setMessage('✅ Registration successful!');
          setTimeout(() => navigate('/login'), 1500);
        }
      } else {
        throw new Error(data.message || data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage(`❗ ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClasses = (fieldName) =>
    `form-control ${errors[fieldName] ? 'is-invalid' : ''}`;

  const renderSelectOptions = (field) => {
    switch (field) {
      case 'semester':
        return [...Array(8)].map((_, i) => (
          <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
        ));
      case 'section':
        return ['Morning', 'Day'].map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ));
      case 'department':
        return ['IT', 'CE', 'SE', 'BCA', 'CIVIL', 'BEEE'].map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">{props.editMode ? 'Update Registration' : 'Create Account'}</h3>
              <p className="mb-0 small">Please fill in all required fields</p>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                {/* Personal Information Section */}
                <fieldset className="mb-4">
                  <legend className="h5 text-primary border-bottom pb-2">Personal Information</legend>
                  
                  <FormField
                    type="email"
                    name="email"
                    label="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    icon="envelope"
                  />

                  <FormField
                    type="text"
                    name="fullName"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    required
                    icon="user"
                    darkMode={props.mode === 'dark'}
                  />
                </fieldset>

                {/* Security Section */}
                <fieldset className="mb-4">
                  <legend className="h5 text-primary border-bottom pb-2">Security</legend>
                  
                  <FormField
                    type="password"
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    helpText="Password must contain at least 8 characters, including uppercase, lowercase, number, and special character."
                    icon="lock"
                  />

                  <FormField
                    type="password"
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    icon="lock"
                  />
                </fieldset>

                {/* Role Selection */}
                <div className="mb-4">
                  <label htmlFor="roleSelect" className="form-label fw-bold">Account Type</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person-badge"></i></span>
                    <select
                      id="roleSelect"
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                {/* Student-specific fields */}
                {formData.role === 'student' && (
                  <fieldset className="mb-4">
                    <legend className="h5 text-primary border-bottom pb-2">Academic Information</legend>
                    
                    <div className="row g-3">
                      {['semester', 'section', 'department'].map((field) => (
                        <div key={field} className="col-md-4">
                          <label className="form-label">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className={`bi bi-${field === 'semester' ? 'calendar' : field === 'section' ? 'people' : 'building'}`}></i>
                            </span>
                            <select
                              className={getFieldClasses(field)}
                              name={field}
                              value={formData[field]}
                              onChange={handleChange}
                            >
                              <option value="">Select {field}</option>
                              {renderSelectOptions(field)}
                            </select>
                            {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12">
                        <FormField
                          type="text"
                          name="collegeRoll"
                          label="College Roll Number"
                          value={formData.collegeRoll}
                          onChange={handleChange}
                          error={errors.collegeRoll}
                          required
                          placeholder="e.g., 221506"
                          icon="123"
                        />
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Photo Upload Section */}
                <fieldset className="mb-4">
                  <legend className="h5 text-primary border-bottom pb-2">Profile Photo</legend>
                  <PhotoUploadSection
                    photo={photo}
                    isWebcamOpen={isWebcamOpen}
                    setIsWebcamOpen={setIsWebcamOpen}
                    handlePhotoCapture={handlePhotoCapture}
                    setPhoto={setPhoto}
                    error={errors.photo}
                  />
                </fieldset>

                <div className="d-grid gap-2">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    message={message}
                  />
                </div>
              </form>
            </div>
            
            <div className="card-footer bg-light">
              <p className="text-muted small mb-0">
                Already have an account? <a href="/login" className="text-primary">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ type, name, label, value, onChange, error, required, placeholder, helpText, icon, darkMode }) => (
  <div className="mb-3">
    <label htmlFor={`${name}Input`} className="form-label fw-bold">{label}</label>
    <div className="input-group">
      <span className="input-group-text">
        <i className={`bi bi-${icon}`}></i>
      </span>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={`${name}Input`}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={darkMode ? { backgroundColor: 'black', color: 'white' } : {}}
      />
      {error && (
        <span className="input-group-text text-danger">
          <i className="bi bi-exclamation-circle"></i>
        </span>
      )}
    </div>
    {error && <div className="invalid-feedback d-block">{error}</div>}
    {helpText && <small className="form-text text-muted">{helpText}</small>}
  </div>
);

const PhotoUploadSection = ({ photo, isWebcamOpen, setIsWebcamOpen, handlePhotoCapture, setPhoto, error }) => (
  <div>
    {error && <div className="alert alert-danger">{error}</div>}

    <div className="d-flex flex-wrap gap-2 mb-3">
      <UploadButton
        active={!isWebcamOpen}
        onClick={() => setIsWebcamOpen(false)}
        disabled={!!photo}
        icon="upload"
        label="Upload Photo"
      />
      <UploadButton
        active={isWebcamOpen}
        onClick={() => setIsWebcamOpen(true)}
        disabled={!!photo}
        icon="camera"
        label="Take Photo"
      />
    </div>

    {!isWebcamOpen && !photo && (
      <FileUpload setPhoto={setPhoto} />
    )}

    {isWebcamOpen && !photo && (
      <div className="card mb-3 border-primary">
        <div className="card-body">
          <WebcamCapture onCapture={handlePhotoCapture} />
        </div>
      </div>
    )}

    {photo && <PhotoPreview photo={photo} setPhoto={setPhoto} />}
  </div>
);

const UploadButton = ({ active, onClick, disabled, icon, label }) => (
  <button
    type="button"
    className={`btn ${active ? 'btn-outline-primary' : 'btn-outline-secondary'} d-flex align-items-center`}
    onClick={onClick}
    disabled={disabled}
  >
    <i className={`bi bi-${icon} me-2`}></i>
    {label}
  </button>
);

const FileUpload = ({ setPhoto }) => (
  <div className="mb-3">
    <div className="file-drop-area border rounded p-3 text-center">
      <i className="bi bi-cloud-arrow-up fs-1 text-muted"></i>
      <p className="mb-1">Drag & drop your photo here</p>
      <p className="small text-muted mb-2">or</p>
      <label className="btn btn-sm btn-primary">
        Browse Files
        <input
          type="file"
          accept="image/*"
          className="d-none"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setPhoto(reader.result);
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
      <div className="small mt-2 text-muted">Accepted formats: .jpg, .png, .jpeg</div>
    </div>
  </div>
);

const PhotoPreview = ({ photo, setPhoto }) => (
  <div className="text-center">
    <div className="card border-success">
      <div className="card-header bg-success text-white">
        <i className="bi bi-check-circle me-2"></i>
        Photo Uploaded
      </div>
      <div className="card-body">
        <img
          src={photo}
          alt="Uploaded"
          className="img-thumbnail mb-3"
          style={{
            maxWidth: '200px',
            borderRadius: '10px'
          }}
        />
        <div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => window.confirm("Remove this photo?") && setPhoto(null)}
          >
            <i className="bi bi-trash me-2"></i>
            Remove Photo
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SubmitButton = ({ isSubmitting, message }) => (
  <div className="mt-4">
    <button
      type="submit"
      className="btn btn-primary btn-lg w-100"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Processing...
        </>
      ) : (
        <>
          <i className="bi bi-check-circle me-2"></i>
          Submit Registration
        </>
      )}
    </button>

    {message && (
      <div className={`alert mt-3 alert-dismissible fade show ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
        {message}
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    )}
  </div>
);

export default Register;