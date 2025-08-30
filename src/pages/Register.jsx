import React, {useState} from 'react';
import {Eye, EyeOff, Mail, Lock, X, Calendar, User} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {Link} from "react-router-dom";

// Toast component
const Toast = ({message, type, onClose}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({currentStep, totalSteps}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-sm font-medium"
          style={{color: '#F2F2F2'}}
        >
          Step {currentStep} of {totalSteps}
        </span>
        <span
          className="text-sm"
          style={{color: '#B3B3B2'}}
        >
          {Math.round(percentage)}%
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full"
        style={{backgroundColor: '#262626'}}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#C33636',
            width: `${percentage}%`
          }}
        ></div>
      </div>
    </div>
  );
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 for password, 2 for personal info
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const {register, checkEmail} = useAuth();

  const showToast = (message, type = 'info') => {
    setToast({message, type});
  };

  const closeToast = () => {
    setToast(null);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateDateOfBirth = (date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  // Helper function to handle server errors
  const handleServerError = (error) => {
    console.error('Server error:', error);
    setErrors({});

    if (error.response?.data) {
      const errorData = error.response.data;

      if (errorData.error && typeof errorData.error === 'string') {
        showToast(errorData.error, 'error');
        return;
      }

      if (errorData.error === 'Validation failed' && errorData.details) {
        const fieldErrors = {};
        let firstErrorMessage = '';

        errorData.details.forEach((detail, index) => {
          if (detail.field && detail.message) {
            fieldErrors[detail.field] = detail.message;
            if (index === 0) {
              firstErrorMessage = detail.message;
            }
          }
        });

        setErrors(fieldErrors);
        showToast(firstErrorMessage || 'Please fix the validation errors', 'error');
        return;
      }

      if (Array.isArray(errorData.details)) {
        const fieldErrors = {};
        let firstErrorMessage = '';

        errorData.details.forEach((detail, index) => {
          if (detail.field && detail.message) {
            fieldErrors[detail.field] = detail.message;
            if (index === 0) {
              firstErrorMessage = detail.message;
            }
          }
        });

        setErrors(fieldErrors);
        showToast(firstErrorMessage || 'Please fix the validation errors', 'error');
        return;
      }
    }

    if (error.message) {
      showToast(error.message, 'error');
      return;
    }

    showToast('Something went wrong. Please try again.', 'error');
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (!email.trim()) {
      setErrors({email: 'Email is required'});
      showToast('Please enter your email address', 'error');
      return;
    }

    if (!validateEmail(email)) {
      setErrors({email: 'Please enter a valid email address'});
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await checkEmail(email);
      console.log('Email check response:', res);

      if (res && res.exists) {
        showToast('An account with this email already exists', 'error');
      } else {
        setShowRegistrationModal(true);
        setModalStep(1);
        showToast('Please create your password', 'info');
      }
    } catch (error) {
      handleServerError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordStep = (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation for password step
    if (!password.trim()) {
      setErrors({password: 'Password is required'});
      showToast('Please enter a password', 'error');
      return;
    }

    if (!validatePassword(password)) {
      setErrors({password: 'Password must be at least 6 characters'});
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!confirmPassword.trim()) {
      setErrors({confirmPassword: 'Please confirm your password'});
      showToast('Please confirm your password', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setErrors({confirmPassword: 'Passwords do not match'});
      showToast('Passwords do not match', 'error');
      return;
    }

    setModalStep(2);
    showToast('Please provide your personal information', 'info');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation for personal info
    if (!dateOfBirth) {
      setErrors({dateOfBirth: 'Date of birth is required'});
      showToast('Please enter your date of birth', 'error');
      return;
    }

    if (!name) {
      setErrors({name: 'Name is required'});
      showToast('Please enter your name', 'error');
      return;
    }

    if (!validateDateOfBirth(dateOfBirth)) {
      setErrors({dateOfBirth: 'You must be at least 13 years old'});
      showToast('You must be at least 13 years old', 'error');
      return;
    }

    if (!gender) {
      setErrors({gender: 'Please select your gender'});
      showToast('Please select your gender', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        email,
        name,
        password,
        dateOfBirth,
        gender
      };

      const res = await register(registrationData);
      console.log('Registration response:', res);

      if (res) {
        showToast('Account created successfully! Welcome!', 'success');

        // Reset form and close modal after successful registration
        setTimeout(() => {
          setShowRegistrationModal(false);
          setEmail('');
          setName('');
          setPassword('');
          setConfirmPassword('');
          setDateOfBirth('');
          setGender('');
          setErrors({});
          setModalStep(1);
        }, 1000);
      } else {
        showToast('Registration completed, but response format unexpected', 'info');
      }
    } catch (error) {
      handleServerError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    showToast('Google Sign-Up clicked - implement your logic here', 'info');
    // Implement Google Sign-Up logic here
  };

  const handleBackStep = () => {
    if (modalStep === 2) {
      setModalStep(1);
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors.dateOfBirth;
        delete newErrors.gender;
        return newErrors;
      });
    }
  };

  // Handle modal close - reset everything
  const handleModalClose = () => {
    setShowRegistrationModal(false);
    setPassword('');
    setConfirmPassword('');
    setDateOfBirth('');
    setGender('');
    setModalStep(1);
    setErrors(prevErrors => {
      const newErrors = {...prevErrors};
      delete newErrors.password;
      delete newErrors.confirmPassword;
      delete newErrors.dateOfBirth;
      delete newErrors.gender;
      return newErrors;
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #1F1F1F 100%)`,
      }}
    >
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* Main Register Card */}
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl mb-4"
        style={{backgroundColor: '#1F1F1F', border: '1px solid #262626'}}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{color: '#F2F2F2'}}
          >
            Create Account
          </h1>
          <p
            className="text-sm"
            style={{color: '#B3B3B2'}}
          >
            Join us today and get started
          </p>
        </div>

        {/* Email Form */}
        <div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{color: '#F2F2F2'}}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{color: '#B3B3B2'}}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue(e)}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                }`}
                style={{
                  backgroundColor: '#262626',
                  borderColor: errors.email ? '#ef4444' : '#404040',
                  color: '#F2F2F2'
                }}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              backgroundColor: '#C33636',
              color: '#FCFCFC',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#CC4343';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#C33636';
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </div>

        {/* Footer */}
        <p
          className="text-center text-sm mt-6"
          style={{color: '#B3B3B2'}}
        >
          Already have an account?{' '}
          <Link
            to={"/login"}
            className="font-semibold hover:underline"
            style={{color: '#D65252'}}
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Google Sign Up Button - At Bottom */}
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <div
            className="flex-1 h-px"
            style={{backgroundColor: '#404040'}}
          ></div>
          <span
            className="px-4 text-sm"
            style={{color: '#B3B3B2'}}
          >
            or
          </span>
          <div
            className="flex-1 h-px"
            style={{backgroundColor: '#404040'}}
          ></div>
        </div>

        <button
          onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/auth/google`}
          className="w-full px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
          style={{
            backgroundColor: '#262626',
            borderColor: '#404040',
            color: '#F2F2F2'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
          style={{backgroundColor: 'rgba(15, 15, 15, 0.8)'}}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{backgroundColor: '#1F1F1F', border: '1px solid #262626'}}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{color: '#F2F2F2'}}
              >
                Complete Registration
              </h2>
              <button
                onClick={handleModalClose}
                className="p-1 rounded hover:bg-gray-700"
                style={{color: '#B3B3B2'}}
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              currentStep={modalStep}
              totalSteps={2}
            />

            {/* User Info */}
            <div
              className="mb-6 p-3 rounded-lg"
              style={{backgroundColor: '#262626'}}
            >
              <p
                className="text-sm"
                style={{color: '#B3B3B2'}}
              >Creating account for
              </p>
              <p
                className="font-medium"
                style={{color: '#F2F2F2'}}
              >{email}</p>
            </div>

            {/* Step 1: Password */}
            {modalStep === 1 && (
              <div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.password ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{color: '#B3B3B2'}}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.confirmPassword ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{color: '#B3B3B2'}}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> :
                        <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePasswordStep}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: '#C33636',
                    color: '#FCFCFC',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#CC4343';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#C33636';
                  }}
                >
                  Next Step
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {modalStep === 2 && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleContinue(e)}
                      placeholder="Enter your name"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.email ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.dateOfBirth ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{color: '#F2F2F2'}}
                  >
                    Sex
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      size={20}
                      style={{color: '#B3B3B2'}}
                    />
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 appearance-none ${
                        errors.gender ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-400'
                      }`}
                      style={{
                        backgroundColor: '#262626',
                        borderColor: errors.gender ? '#ef4444' : '#404040',
                        color: '#F2F2F2'
                      }}
                      disabled={isLoading}
                    >
                      <option
                        value=""
                        hidden
                      >Select your gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="text-red-400 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 border hover:shadow-lg"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#404040',
                      color: '#F2F2F2',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#262626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{
                      backgroundColor: '#C33636',
                      color: '#FCFCFC',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = '#CC4343';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = '#C33636';
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;