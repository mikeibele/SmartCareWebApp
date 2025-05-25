// src/components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    specialty: '',
    license_number: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const {
      email,
      password,
      confirmPassword,
      full_name,
      specialty,
      license_number,
      phone,
    } = formData;

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !full_name ||
      !specialty ||
      !license_number ||
      !phone
    ) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(email, password, {
        full_name,
        specialty,
        license_number,
        phone,
      });
      toast.success('Account created successfully! Please sign in.', {
        duration: 5000,
      });
      navigate('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Create your SmartCare account
      </h1>

      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="full_name"
            label="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <Input
            id="specialty"
            label="Medical Specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="license_number"
            label="License Number"
            value={formData.license_number}
            onChange={handleChange}
            required
          />

          <Input
            id="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          id="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign up
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
