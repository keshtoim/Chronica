import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureSingletons } from '@/data/db'

// Создаём singleton-записи (профиль геймификации, настройки) один раз при старте — до рендера,
// чтобы репозитории могли просто читать их внутри useLiveQuery без readwrite-транзакции
// (Dexie запрещает readwrite-транзакции внутри querier'а live query).
await ensureSingletons()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
