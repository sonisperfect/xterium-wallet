import { createContext, useContext } from 'react'

export const IntroContext = createContext({
  revealed: true,
  onHeroReady: () => {},
})

export function useIntro() {
  return useContext(IntroContext)
}
