import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom'
import * as Sentry from '@sentry/react'

import Videos from '@/scenes/Videos'
import Home from '@/scenes/Home'
import Playlists from '@/scenes/Playlists'
import PlaylistPlayer from '@/scenes/PlaylistPlayer'

import './index.css'
import Layout from './Layout'
import VideoPlayer from '@/scenes/VideoPlayer'

import { serviceWorkerFile } from 'virtual:vite-plugin-service-worker'

Sentry.init({
  dsn: 'https://65eb81765d3a2badf689190f63cc2e8c@o4507159862968320.ingest.de.sentry.io/4507159866179664',
  integrations: [
    // See docs for support of different versions of variation of react router
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration(),
  ],

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  denyUrls: ['localhost'],
})

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: '/',
        Component: Home,
      },
      {
        path: '/playlists',
        Component: Playlists,
      },
      {
        path: '/playlists/:id',
        Component: PlaylistPlayer,
      },
      {
        path: '/videos',
        Component: Videos,
      },
      {
        path: '/videos/:videoId',
        Component: VideoPlayer,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

navigator.serviceWorker.register(serviceWorkerFile, {
  type: 'module',
})
