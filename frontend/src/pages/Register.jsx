import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    telepon: '',
    alamat: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const ubah = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Konfirmasi password tidak sama');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Akun ${user.name} berhasil dibuat!`);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Daftar Akun"
      title="Buat akun Fashion Store"
      subtitle="Daftar gratis dan nikmati kemudahan belanja di Fashion Store."
      footer={
        <p className="text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Masuk di sini
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="auth-fields space-y-4">
        <div>
          <label className="label">Nama lengkap</label>
          <input
            name="name"
            value={form.name}
            onChange={ubah}
            className="input auth-input"
            placeholder="Nama sesuai identitas"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={ubah}
              className="input auth-input"
              placeholder="nama@email.com"
              required
            />
          </div>
          <div>
            <label className="label">Nomor telepon</label>
            <input
              name="telepon"
              value={form.telepon}
              onChange={ubah}
              className="input auth-input"
              placeholder="08xxxxxxxxxx"
              maxLength={15}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Alamat lengkap</label>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={ubah}
            className="input auth-input min-h-[80px] resize-y"
            placeholder="Nama jalan, nomor rumah, kota, kode pos"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={ubah}
                className="input auth-input pr-11"
                placeholder="Min. 6 karakter"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Konfirmasi password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={ubah}
              className="input auth-input"
              placeholder="Ulangi password"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary auth-submit w-full py-3">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Membuat akun...
            </>
          ) : (
            'Daftar Sekarang'
          )}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          Dengan mendaftar, Anda menyetujui syarat dan ketentuan serta kebijakan privasi
          Fashion Store.
        </p>
      </form>
    </AuthShell>
  );
}
