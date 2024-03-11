import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Chart from './pages/Chart'

const router = createBrowserRouter([
  {
    path: "/",
    element:  <App />,
  },
  {
    path:'/chart/quarterStart/:quarterStart/quarterEnd/:quarterEnd/houseType/:houseType',
    element: <Chart/>
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
