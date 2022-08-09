import { Suspense } from "react"
import { useRoutes } from "react-router-dom"
import { AppRoutes } from "./routes"


function App() {

  const element = useRoutes(AppRoutes);

  return (
    <Suspense>
      {element}
    </Suspense>
  )
}

export default App
