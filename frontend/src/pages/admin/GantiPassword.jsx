import { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function GantiPassword() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.password_confirmation) return toast.error('Konfirmasi password baru belum sama.');
    setSaving(true);
    try {
      const { data } = await api.put('/profil', {
        name: user.name,
        email: user.email,
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      await refresh();
      setForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success(data.message || 'Password berhasil diperbarui.');
    } catch (error) { toast.error(apiError(error)); }
    finally { setSaving(false); }
  };

  const inputType = show ? 'text' : 'password';
  return <div className="space-y-5">
    <div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Ganti Password</h2><p className="mt-1 text-sm text-slate-500">Perbarui kata sandi akun admin secara aman.</p></div>
    <section className="card max-w-2xl p-5 sm:p-7"><div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" /><p className="text-sm text-emerald-800">Gunakan password minimal 6 karakter dan jangan bagikan kepada orang lain.</p></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="label">Password saat ini</span><input required autoComplete="current-password" type={inputType} value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} className="input" /></label><label className="block"><span className="label">Password baru</span><div className="relative"><input required minLength={6} autoComplete="new-password" type={inputType} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input pr-12" /><button type="button" onClick={() => setShow((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400" aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="block"><span className="label">Ulangi password baru</span><input required minLength={6} autoComplete="new-password" type={inputType} value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="input" /></label><button type="submit" disabled={saving} className="btn-primary mt-2"><KeyRound className="h-4 w-4" />{saving ? 'Menyimpan...' : 'Simpan Password Baru'}</button></form></section>
  </div>;
}
