import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import KnowledgePage from './pages/KnowledgePage';
import InterviewPage from './pages/InterviewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'knowledge',
        element: <KnowledgePage />
      },
      {
        path: 'interview',
        element: <InterviewPage />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
