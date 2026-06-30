import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Login } from '../pages/Login'
import { Overview } from '../pages/Overview'
import { Buses } from '../pages/Buses'
import { Schedules } from '../pages/Schedules'
import { BusLayoutBuilder } from '../pages/BusLayoutBuilder'
import { SeatLayout } from '../pages/SeatLayout'
import { Bookings } from '../pages/Bookings'
import { Profile } from '../pages/Profile'
import { BusStops } from '../pages/BusStops'
import { Cities } from '../pages/admin/Cities'
import { Routes as BusRoutes } from '../pages/admin/Routes'
import { Coupons } from '../pages/admin/Coupons'
import { Operators } from '../pages/admin/Operators'
import { Logs } from '../pages/admin/Logs'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'OPERATOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="buses" element={<Buses />} />
          <Route path="buses/:busId/layout" element={<BusLayoutBuilder />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="seats" element={<SeatLayout />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bus-stops" element={<BusStops />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="admin/cities" element={<Cities />} />
          <Route path="admin/routes" element={<BusRoutes />} />
          <Route path="admin/coupons" element={<Coupons />} />
          <Route path="admin/operators" element={<Operators />} />
          <Route path="admin/logs" element={<Logs />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
