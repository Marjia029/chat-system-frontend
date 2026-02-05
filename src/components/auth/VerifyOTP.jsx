import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'registration';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyOTP(email, otp, purpose);
    setLoading(false);
    
    if (result.success) {
      if (purpose === 'registration') {
        navigate('/login');
      } else if (purpose === 'password_reset') {
        navigate('/reset-password', { state: { email, token: result.token } });
      }
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    const result = await resendOTP(email, purpose);
    setResendLoading(false);
    
    if (result.success) {
      setCountdown(120); // 2 minutes cooldown
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;