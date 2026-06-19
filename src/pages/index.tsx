import { Box, Header, Page } from "zmp-ui"

export default function TrangChPage() {
  return (
    <Page>
      <Header title="Trang chủ" showBackIcon={false} backgroundColor="#0068FF" />
      <div className="relative w-full overflow-hidden rounded-2xl">{/* HeroSection: Siêu Sale Cuối Tuần 🔥 */}</div>
      <Box className="flex flex-row gap-2 items-start p-4">
        <button className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border text-white border-transparent" style={{ backgroundColor: "#0068FF", borderColor: "#0068FF" }}>Tất cả</button>
        <button className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border bg-white text-gray-600 border-gray-200">Áo</button>
        <button className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border bg-white text-gray-600 border-gray-200">Quần</button>
        <button className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border bg-white text-gray-600 border-gray-200">Giày</button>
      </Box>
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* ProductCard: Áo thun Oversized */}</div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* ProductCard: Quần jeans slim fit */}</div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* ProductCard: Giày sneaker trắng */}</div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* ProductCard: Túi canvas local brand */}</div>
      </div>
    </Page>
  )
}
