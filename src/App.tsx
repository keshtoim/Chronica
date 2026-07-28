import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { useGamificationProfile } from '@/modules/gamification/hooks/useGamificationProfile'
import { OnboardingFlow } from '@/modules/onboarding/OnboardingFlow'

function App() {
  const profile = useGamificationProfile()

  if (!profile) return null
  if (!profile.onboardingComplete) return <OnboardingFlow />

  return <RouterProvider router={router} />
}

export default App
