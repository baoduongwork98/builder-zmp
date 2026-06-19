import { useNavigate } from "zmp-ui"

const tabs = [
  {
    "key": "1",
    "label": "Trang chủ",
    "icon": "🏠",
    "route": "/"
  },
  {
    "key": "2",
    "label": "Khám phá",
    "icon": "🔍",
    "route": "/kham-pha"
  },
  {
    "key": "3",
    "label": "Cá nhân",
    "icon": "👤",
    "route": "/profile"
  }
]

export default function BottomNavigation() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 w-full flex items-center justify-around bg-white border-t border-gray-200 h-14 px-2 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className="flex flex-col items-center gap-0.5 flex-1"
          onClick={() => { if (tab.route) navigate(tab.route) }}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="text-[10px] font-medium text-gray-500">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
