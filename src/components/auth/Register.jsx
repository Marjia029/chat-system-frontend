import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, User, Lock, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Expanded Validation States
  const [validations, setValidations] = useState({
    length: false,
    capital: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Real-time validation logic
  useEffect(() => {
    const pass = formData.password;
    setValidations({
      length: pass.length >= 8,
      capital: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allValid = Object.values(validations).every(Boolean);
    
    if (!allValid) {
      toast.error("Please satisfy all password requirements");
      return;
    }

    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    
    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email, purpose: 'registration' } });
    }
  };

  const Requirement = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="w-3 h-3 stroke-[3px]" /> : <X className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Create Account</h1>
          <p className="text-gray-600">Secure your profile with a strong password</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email & Username */}
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="johndoe" required />
                </div>
              </div>
            </div>

            {/* Password with Real-time Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all ${
                    formData.password.length > 0 && !Object.values(validations).every(Boolean) 
                    ? 'border-orange-400 ring-2 ring-orange-50' 
                    : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Requirement Checklist Grid */}
              {formData.password.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <ShieldCheck className={`w-4 h-4 ${Object.values(validations).every(Boolean) ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Security Checklist</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Requirement met={validations.length} text="8+ Characters" />
                    <Requirement met={validations.capital} text="Capital Letter" />
                    <Requirement met={validations.lowercase} text="Small Letter" />
                    <Requirement met={validations.number} text="A Number" />
                    <Requirement met={validations.special} text="Special Char" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type={showPassword ? 'text' : 'password'} name="password2" value={formData.password2} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;