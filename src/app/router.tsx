import { createHashRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { CalendarPage } from '@/modules/calendar/CalendarPage'
import { TasksPage } from '@/modules/tasks/TasksPage'
import { HabitsPage } from '@/modules/habits/HabitsPage'
import { ProfilePage } from '@/modules/gamification/ProfilePage'
import { SettingsPage } from '@/modules/settings/SettingsPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/calendar" replace /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'habits', element: <HabitsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
