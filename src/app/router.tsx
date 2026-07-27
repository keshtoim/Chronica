import { createHashRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { CalendarPage } from '@/modules/calendar/CalendarPage'
import { TasksPage } from '@/modules/tasks/TasksPage'
import { HabitsPage } from '@/modules/habits/HabitsPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'habits', element: <HabitsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
