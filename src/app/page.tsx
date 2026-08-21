import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#0A33FF]/3 via-transparent to-[#0A33FF]/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#0A33FF]/3 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16 md:mb-24">
            <div className="flex items-center gap-3">
              <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-[#19191A]">زرین‌پال آنالیتیکس</h1>
                <p className="text-[10px] text-[#6b7280]">تحلیل هوشمند پرداخت</p>
              </div>
            </div>
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-[#0A33FF] text-white text-sm font-medium hover:bg-[#0A33FF]/90 transition-colors shadow-sm"
            >
              شروع استفاده
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A33FF]/10 text-[#0A33FF] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A33FF] animate-pulse" />
              پردازش ۲.۲ میلیون تراکنش
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-[#19191A] leading-tight mb-6">
              تحلیل هوشمند
              <span className="text-[#0A33FF]"> پرداخت‌ها</span>
              <br />
              با هوش مصنوعی
            </h1>
            <p className="text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed mb-10">
              پلتفرم هوش مصنوعی تحلیل پرداخت برای پذیرندگان زرین‌پال.
              سوالات خود را به زبان ساده بپرسید و پاسخ‌های دقیق با قابلیت ردیابی دریافت کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A33FF] text-white font-medium hover:bg-[#0A33FF]/90 transition-all shadow-lg shadow-[#0A33FF]/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                شروع مکالمه
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#DADBE1] bg-white text-[#19191A] font-medium hover:bg-[#F5F5F5] transition-colors"
              >
                مشاهده داشبورد
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[#19191A] mb-3">امکانات پلتفرم</h2>
          <p className="text-[#6b7280]">ابزارهای متنوع برای تحلیل جامع پرداخت‌ها</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              title: "دستیار هوش مصنوعی",
              description: "سوالات خود درباره پرداخت‌ها را به زبان ساده فارسی بپرسید",
              color: "bg-[#0A33FF]/10 text-[#0A33FF]",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "بینش‌های قابل ردیابی",
              description: "هر بینش با کوئری SQL و محاسبات دقیق قابل ردیابی است",
              color: "bg-[#16A34A]/10 text-[#16A34A]",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              title: "تحلیل جامع PSP",
              description: "مقایسه عملکرد ارائه‌دهندگان خدمات پرداخت و بانک‌ها",
              color: "bg-[#FFD60A]/20 text-[#92400E]",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[#DADBE1] bg-white hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-[#19191A] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-[#DADBE1]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "۲.۲M+", label: "تراکنش تحلیل شده" },
            { value: "۵۰K+", label: "پذیرنده فعال" },
            { value: "۱۲+", label: "ابزار تحلیل" },
            { value: "Real-time", label: "پاسخ‌دهی" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4">
              <p className="text-2xl md:text-3xl font-bold text-[#0A33FF]">{stat.value}</p>
              <p className="text-sm text-[#6b7280] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#DADBE1] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-6 h-6 object-contain" />
            <span className="text-sm font-medium text-[#19191A]">زرین‌پال آنالیتیکس</span>
          </div>
          <p className="text-xs text-[#6b7280]">
            پلتفرم تحلیل پرداخت با هوش مصنوعی — هکاتون زرین‌پال ۱۴۰۴
          </p>
        </div>
      </footer>
    </div>
  );
}
