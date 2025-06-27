import React, { useState, useEffect } from 'react';
import WebcamCapture from './WebcamCapture';
import { authFetch } from '../Helper/Csrf_token';

const Register = (props) => {
  // Consolidated form state
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

  // Pre-fetch CSRF token on mount
  useEffect(() => {
    fetch('/api/csrf/', { credentials: 'include' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Clear student fields when role changes to teacher
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

  const validateForm = () => {
    const newErrors = {};
    const { fullName, email, password, confirmPassword, role } = formData;

    // Common validations
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number, and special character';
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

  try {
    const formPayload = new FormData();
    // Append all fields
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

    // Handle photo upload
    const blob = await fetch(photo).then(res => res.blob());
    formPayload.append('avatar', blob, 'photo.jpg');

    // Debug: Log FormData contents
    for (let [key, value] of formPayload.entries()) {
      console.log(key, value);
    }

    const response = await authFetch('/api/register/', {
      method: 'POST',
      body: formPayload,
      // DON'T set Content-Type header - FormData sets it automatically with boundary
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('✅ Registration successful!');
      setTimeout(() => window.location.href = '/login', 1500);
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    setMessage(`❗ ${error.message || 'Registration failed. Please try again.'}`);
  } finally {
    setIsSubmitting(false);
  }
};

  // Helper functions
  const getFieldClasses = (fieldName) => 
    `form-control ${errors[fieldName] ? 'is-invalid' : ''}`;

  const renderSelectOptions = (field) => {
    switch (field) {
      case 'semester':
        return [...Array(8)].map((_, i) => (
          <option key={i+1} value={`Semester ${i+1}`}>Semester {i+1}</option>
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
    <div className="total" style={{ marginLeft: '10px' }}>
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <FormField
          type="email"
          name="email"
          label="Email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        {/* Full Name Field */}
        <FormField
          type="text"
          name="fullName"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          required
          darkMode={props.mode === 'dark'}
        />

        {/* Password Fields */}
        <FormField
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          helpText="Password must contain at least 8 characters, including uppercase, lowercase, number, and special character."
        />

        <FormField
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {/* Role Selection */}
        <div className="my-3">
          <label htmlFor="roleSelect" className="form-label">Role</label>
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

        {/* Student-specific fields */}
        {formData.role === 'student' && (
          <>
            {['semester', 'section', 'department'].map((field) => (
              <div key={field} className="my-3">
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
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
            ))}

            <FormField
              type="text"
              name="collegeRoll"
              label="College Roll Number"
              value={formData.collegeRoll}
              onChange={handleChange}
              error={errors.collegeRoll}
              required
              placeholder="e.g., 221506"
            />
          </>
        )}

        {/* Photo Upload Section */}
        <PhotoUploadSection 
          photo={photo}
          isWebcamOpen={isWebcamOpen}
          setIsWebcamOpen={setIsWebcamOpen}
          handlePhotoCapture={handlePhotoCapture}
          setPhoto={setPhoto}
          error={errors.photo}
        />

        <SubmitButton 
          isSubmitting={isSubmitting} 
          message={message} 
        />
      </form>
    </div>
  );
};

// Reusable Form Field Component
const FormField = ({ type, name, label, value, onChange, error, required, placeholder, helpText, darkMode }) => (
  <div className="my-3">
    <label htmlFor={`${name}Input`} className="form-label">{label}</label>
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
    {error && <div className="invalid-feedback">{error}</div>}
    {helpText && <div className="form-text">{helpText}</div>}
  </div>
);

// Photo Upload Component
const PhotoUploadSection = ({ photo, isWebcamOpen, setIsWebcamOpen, handlePhotoCapture, setPhoto, error }) => (
  <div className="my-4">
    <label className="form-label fw-bold">Upload or Capture Photo</label>
    {error && <div className="text-danger small mb-2">{error}</div>}
    
    <div className="mb-3">
      <UploadButton
        active={!isWebcamOpen}
        onClick={() => setIsWebcamOpen(false)}
        disabled={!!photo}
        icon="📁"
        label="Upload from Device"
      />
      <UploadButton
        active={isWebcamOpen}
        onClick={() => setIsWebcamOpen(true)}
        disabled={!!photo}
        icon="📷"
        label="Capture with Camera"
      />
    </div>

    {!isWebcamOpen && !photo && (
      <FileUpload setPhoto={setPhoto} />
    )}

    {isWebcamOpen && !photo && (
      <div className="mb-3">
        <WebcamCapture onCapture={handlePhotoCapture} />
      </div>
    )}

    {photo && <PhotoPreview photo={photo} setPhoto={setPhoto} />}
  </div>
);

// Small reusable components
const UploadButton = ({ active, onClick, disabled, icon, label }) => (
  <button
    type="button"
    className={`btn ${active ? 'btn-outline-primary' : 'btn-secondary'} me-2`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon} {label}
  </button>
);

const FileUpload = ({ setPhoto }) => (
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
);

const PhotoPreview = ({ photo, setPhoto }) => (
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
);

const SubmitButton = ({ isSubmitting, message }) => (
  <>
    <button 
      type="submit" 
      className="btn btn-primary" 
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
    
    {message && (
      <div className={`alert mt-3 ${
        message.startsWith('✅') ? 'alert-success' : 'alert-danger'
      }`}>
        {message}
      </div>
    )}
  </>
);

export default Register;