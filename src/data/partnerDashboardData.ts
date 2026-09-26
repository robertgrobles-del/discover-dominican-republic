export interface ReservationItem {
  id: string;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: string;
  notes: string;
  realId?: string;
}

export interface ReviewItem {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
  reply: string;
}

export interface ChartDataPoint {
  name: string;
  ventas: number;
}

export const initialReservations: ReservationItem[] = [
  { id: "RES-8921", guestName: "Sarah Connor", email: "sarah@sky.net", checkIn: "2026-06-20", checkOut: "2026-06-25", amount: 2250, status: "paid", notes: "Prefiere piso alto" },
  { id: "RES-4432", guestName: "Michael Jordan", email: "mj23@bulls.com", checkIn: "2026-06-28", checkOut: "2026-07-02", amount: 3500, status: "paid", notes: "Cama extra grande" },
  { id: "RES-1120", guestName: "Penelope Cruz", email: "penelope@cruz.es", checkIn: "2026-07-05", checkOut: "2026-07-10", amount: 1800, status: "pending", notes: "Vegana" },
  { id: "RES-9801", guestName: "John Doe", email: "john@doe.com", checkIn: "2026-06-15", checkOut: "2026-06-18", amount: 900, status: "cancelled", notes: "" }
];

export const initialReviews: ReviewItem[] = [
  { id: 1, author: "Juan Almonte", rating: 5, date: "2026-06-12", comment: "Excelente servicio y la vista es inmejorable. El personal muy atento.", reply: "" },
  { id: 2, author: "Alice Smith", rating: 4, date: "2026-06-08", comment: "The food was amazing but check-in took longer than expected.", reply: "" }
];

export const partnerChartData: ChartDataPoint[] = [
  { name: "Ene", ventas: 12000 },
  { name: "Feb", ventas: 15000 },
  { name: "Mar", ventas: 18500 },
  { name: "Abr", ventas: 16000 },
  { name: "May", ventas: 21000 },
  { name: "Jun", ventas: 25400 }
];
