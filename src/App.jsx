import React from 'react'
import { ThirdwebProvider } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"
import UnicornPOLStaking from './components/UnicornPOLStaking.jsx'

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "4e8c81182c3709ee441e30d776223354"
})

function App() {
  return (
    <ThirdwebProvider>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <UnicornPOLStaking client={client} />
      </div>
    </ThirdwebProvider>
  )
}

export default App