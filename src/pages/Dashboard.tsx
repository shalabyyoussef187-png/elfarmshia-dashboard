import { Package, Tag, Building2, Pill, TrendingUp } from 'lucide-react'
import { DEFAULT_BRANDS, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/defaultData'

function Dashboard() {
  const stats = [
    { label: 'الأدوية', value: String(DEFAULT_PRODUCTS.length), icon: Pill, color: '#1a5c3a', bg: '#e8f5ee', trend: '+12%' },
    { label: 'المنتجات', value: String(DEFAULT_PRODUCTS.length), icon: Package, color: '#c9a84c', bg: '#f9f3e3', trend: '+8%' },
    { label: 'الفئات', value: String(DEFAULT_CATEGORIES.length), icon: Tag, color: '#2563eb', bg: '#eff6ff', trend: '+2%' },
    { label: 'الماركات', value: String(DEFAULT_BRANDS.length), icon: Building2, color: '#7c3aed', bg: '#f5f3ff', trend: '+5%' },
  ]

  // const recentProducts = DEFAULT_PRODUCTS.slice(0, 5).map((product, index) => ({
  //   name: product.name,
  //   category: product.category.name,
  //   brand: product.brand.name,
  //   price: product.price,
  //   status: index % 4 === 0 ? 'منتهي' : 'متاح',
  // }))

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-20 w-full min-w-0">

      {/* إحصائيات — شبكة ٢×٢ على التلفون، صف واحد على الشاشات العريضة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0"
          >
            <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-green-500 font-medium shrink-0">
                <TrendingUp size={13} /> {trend}
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-medium text-gray-800 tabular-nums truncate">{value}</p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 line-clamp-2">{label}</p>
          </div>
        ))}
      </div>

    
    </div>
  )
}

export default Dashboard
