// AdminCreateClass.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authFetch } from '../../Helper/Csrf_token';

const AdminCreateClass = () => {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    semester: '',
    department: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/create-class/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create class');
      toast.success('✅ Class created');
      setFormData({ name: '', year: '', semester: '', department: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Class Name" onChange={handleChange} value={formData.name} required />
      <input name="year" placeholder="Year" onChange={handleChange} value={formData.year} type="number" required />
      <input name="semester" placeholder="Semester" onChange={handleChange} value={formData.semester} type="number" required />
      <input name="department" placeholder="Department" onChange={handleChange} value={formData.department} required />
      <button type="submit">Create Class</button>
    </form>
  );
};

export default AdminCreateClass;
