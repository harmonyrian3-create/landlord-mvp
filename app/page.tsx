import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Beta banner */}
      <div className="bg-slate-900 text-white text-sm py-2.5 px-4 text-center">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>
            <strong>Free during beta</strong> — feedback welcome as we shape the product.
          </span>
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Never chase rent again.
        </h1>
        <p className="text-xl text-slate-600 mb-10">
          Track payments, see who&apos;s overdue, and send WhatsApp reminders in one tap.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          {[
            'Add properties, units and tenants in minutes',
            'See paid, pending, and overdue at a glance',
            'Send reminders via WhatsApp — free',
          ].map((f) => (
            <div key={f} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3" />
              <p className="text-slate-700">{f}</p>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-slate-800 transition"
        >
          Get Started — Free
        </Link>

        <p className="mt-6 text-sm text-slate-500">
          No credit card. No SMS fees. Built for Kenyan landlords.
        </p>
      </div>
    </main>
  );
}