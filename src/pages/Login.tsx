import { useState } from "react";
import { Coffee, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
      localStorage.setItem("bloom_auth", "true");
      toast.success("Welcome back to Bloom Coffee Co!");
      navigate("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#8C7A6B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#6E8A63]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 p-8 sm:p-12 relative overflow-hidden">
          
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-[#5C4D43] rounded-xl flex items-center justify-center shadow-sm">
              <Coffee className="w-7 h-7 text-[#FDFBF7]" strokeWidth={2.5} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-[#2C2420] mb-2 tracking-tight">Bloom Coffee Co.</h1>
            <p className="text-[#8C7A6B] text-sm">Sign in to your Intelligence Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8C7A6B] mb-1.5 uppercase tracking-wider">
                Work Email
              </label>
              <input
                type="email"
                defaultValue="admin@bloomcoffee.co"
                className="w-full bg-white/50 border border-[#E5E0DA] rounded-lg px-4 py-3 text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#6E8A63]/50 focus:border-[#6E8A63] transition-all"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#8C7A6B] uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-[#6E8A63] hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full bg-white/50 border border-[#E5E0DA] rounded-lg px-4 py-3 text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#6E8A63]/50 focus:border-[#6E8A63] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5C4D43] hover:bg-[#4A3E36] text-[#FDFBF7] rounded-lg px-4 py-3 font-medium flex items-center justify-center transition-colors shadow-sm disabled:opacity-70 mt-6 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E0DA]/50 text-center">
            <p className="text-xs text-[#8C7A6B]">
              Xeno Engineering Assignment • Built with ♥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
