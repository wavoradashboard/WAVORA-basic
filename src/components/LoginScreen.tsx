import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, UserPlus, LogIn, Sparkles, Building2, AudioLines, Info, ShieldCheck } from 'lucide-react';
import { Plan, User } from '../types';
import { supabase } from '../supabase';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  allUsers: User[];
}

export default function LoginScreen({ onLogin, onRegister, allUsers }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [plan, setPlan] = useState<Plan>('Basic');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      if (!artistName) {
        setError('Artist or Band name is required for registration.');
        setLoading(false);
        return;
      }
      
      try {
        const isAppAdmin = email.toLowerCase() === 'admin@g.g' || email.toLowerCase() === 'wavoradashboard@gmail.com';
        const approvalSetting = isAppAdmin ? true : false;

        // Attempt to sign up the new user in Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: password,
          options: {
            data: {
              artistName: artistName,
              plan: plan,
              isApproved: approvalSetting,
              registeredAt: new Date().toISOString()
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        const newUser: User = {
          email: email.toLowerCase(),
          password,
          artistName,
          plan,
          isApproved: approvalSetting,
          registeredAt: new Date().toISOString(),
        };

        onRegister(newUser);
        if (isAppAdmin) {
          setSuccessMsg('Admin account registered and approved automatically in Supabase Auth! You can now log in.');
        } else {
          setSuccessMsg('Account registered in Supabase safely! It is pending admin approval before you can sign in.');
        }
        setIsSignUp(false);
      } catch (err: any) {
        setError(err.message || 'Supabase authentication registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login flow
      try {
        // 1. Attempt standard sign in on Supabase first
        let authData: any = null;
        let loginError: any = null;
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password
          });
          authData = data;
          loginError = error;
        } catch (e: any) {
          console.warn("Supabase auth signin failed, trying local/mock fallback:", e);
          loginError = e;
        }

        if (!loginError && authData?.user) {
          const u = authData.user;
          const metadata = u.user_metadata || {};
          const isApproved = metadata.isApproved !== undefined ? metadata.isApproved : true;

          if (!isApproved) {
            setError('Account is pending approval. Please sign in as admin (admin@g.g / 232323) to approve your access!');
            setLoading(false);
            return;
          }

          const loggedInUser: User = {
            id: u.id,
            email: u.email!,
            artistName: metadata.artistName || u.email!.split('@')[0],
            plan: metadata.plan || 'Basic',
            isApproved: isApproved,
            registeredAt: u.created_at || new Date().toISOString()
          };

          onLogin(loggedInUser);
          setLoading(false);
          return;
        }

        // 2. If login failed on Supabase but matched local mock database, auto-provision client accounts in Supabase to link them
        const found = allUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (found) {
          const isApproved = found.isApproved;
          if (!isApproved) {
            setError('Account is pending approval. Please sign in as admin (admin@g.g / 232323) to approve your access!');
            setLoading(false);
            return;
          }

          setSuccessMsg('Linking your mock session to your Supabase project credentials...');
          
          try {
            const { error: autoSignUpError } = await supabase.auth.signUp({
              email: found.email,
              password: found.password || 'password',
              options: {
                data: {
                  artistName: found.artistName,
                  plan: found.plan,
                  isApproved: found.isApproved,
                  registeredAt: found.registeredAt
                }
              }
            });

            // Attempt login again now that we synchronized Auth details
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: found.email,
              password: found.password || 'password'
            });

            if (!retryError && retryData?.user) {
              const synchronizedUser: User = {
                ...found,
                id: retryData.user.id
              };
              onLogin(synchronizedUser);
              setLoading(false);
              return;
            }
          } catch (linkError) {
            console.warn("Failed automatic credentials sync step with Supabase:", linkError);
          }

          // Force login fallback anyway if Supabase is initializing/migrating or offline
          onLogin(found);
          setLoading(false);
          return;
        }

        setError(loginError?.message || 'Invalid email or password.');
      } catch (err: any) {
        setError(err.message || 'Supabase connectivity error.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickFill = (targetEmail: string, pass: string) => {
    setEmail(targetEmail);
    setPassword(pass);
    setIsSignUp(false);
    setError('');
    setSuccessMsg('');
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-transparent" id="login_container">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_60%)] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#1c1c1c,transparent_65%)] opacity-20 pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-[#6366F1]/5 blur-3xl ambient-bg-glow pointer-events-none rounded-full" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-gray-900/10 blur-3xl ambient-bg-glow pointer-events-none rounded-full" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 animate-fade-in" id="login_card_grid">
        {/* Left column: Brand/Promo info */}
        <div className="md:col-span-5 text-left space-y-6" id="brand_info_col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-xs text-[#6366F1] font-mono tracking-widest">
            <AudioLines className="w-3.5 h-3.5" />
            GLOBAL MUSIC DISTRIBUTION
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-tight" id="main_logo_wavora">
            Wavora <span className="text-[#6366F1]">Live</span>
          </h1>

          <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
            Distribute your music worldwide to Spotify, Apple Music, TikTok, Amazon, and 150+ major streaming platforms. Keep 100% of your royalties.
          </p>

          <div className="space-y-4 pt-2" id="features_benefits">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-[#6366F1]/10 text-[#6366F1] mt-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-200">Global DSP Delivery</h4>
                <p className="text-[11px] text-gray-500">Automatic generation of official identifiers and secure metadata dispatches.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-[#6366F1]/10 text-[#6366F1] mt-1">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-200">Vanity Publishing Brands</h4>
                <p className="text-[11px] text-gray-500">Unlock custom label lines, personalized C & P copyrights, and guest sub-artist models.</p>
              </div>
            </div>
          </div>


        </div>

        {/* Right column: Interactive form card */}
        <div className="md:col-span-7" id="login_form_col">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
            id="login_animated_box"
          >
            {/* Interactive Auth Tabs - Removed tab switching since only Admin can add users */}
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4" id="login_tabs">
              <LogIn className="w-5 h-5 text-[#6366F1]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[#6366F1]">Sign In to Wavora Live</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" id="auth_form">
              {error && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2" id="login_err">
                  <span className="font-bold flex-shrink-0">⚠️ Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl text-xs text-[#6366F1] flex items-start gap-2" id="login_success">
                  <span className="font-bold flex-shrink-0">✓ Success:</span>
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5" id="login_email_group">
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-550">
                    <Mail className="w-4 h-4 text-gray-450" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#6366F1] transition"
                    placeholder="e.g. artist@wavora.live"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login_email"
                  />
                </div>
              </div>

              <div className="space-y-1.5" id="login_pass_group">
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-550">
                    <Lock className="w-4 h-4 text-gray-450" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#6366F1] transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="login_password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer mt-4 py-3 px-4 bg-white hover:bg-[#6366F1] hover:text-black text-black font-black rounded-xl text-xs uppercase tracking-tight transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                id="btn_auth_submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting to portal...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Account
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-white/5 mt-4" id="login_toggle_footer">
                <p className="text-[10px] text-gray-500 font-medium tracking-tight uppercase leading-relaxed">
                  🔒 Distribution Portal Notice <br />
                  User registration is restricted. Artist accounts can only be added and provisioned by system administrators.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
