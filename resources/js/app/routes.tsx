import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SplashScreen } from '@/app/screens/SplashScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import { UsernameSetupScreen } from '@/app/screens/UsernameSetupScreen';
import { HomeScreen } from '@/app/screens/HomeScreen';
import { CreatePredictionScreen } from '@/app/screens/CreatePredictionScreen';
import { PredictionDetailScreen } from '@/app/screens/PredictionDetailScreen';
import { ProfileScreen } from '@/app/screens/ProfileScreen';
import { LeaderboardScreen } from '@/app/screens/LeaderboardScreen';
import { GroupsScreen } from '@/app/screens/GroupsScreen';
import { AboutScreen } from '@/app/screens/AboutScreen';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { PublicRoute } from '@/app/components/PublicRoute';
import { AuthCallback } from '@/app/screens/AuthCallback';
import { ProfileSetupScreen } from '@/app/screens/ProfileSetupScreen';
import { EmailVerificationScreen } from '@/app/screens/EmailVerificationScreen';

import { ForgotPasswordScreen } from '@/app/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/app/screens/ResetPasswordScreen';

export const router = createBrowserRouter([
  {
    path: "/login",   // ✅ ADD THIS
    element: <LoginScreen />,
  },
  {
    path: '/',
    element: <Navigate to="/splash" replace />,
  },
  {
    path: '/splash',
    Component: SplashScreen,
  },
  {
    element: <PublicRoute />,
    children: [
      // {
      //   path: '/auth',
      //   Component: LoginScreen,
      // },
      // {
      //   path: '/auth/callback',
      //   Component: AuthCallback,
      // },

//       {
//   path: '/auth/google/callback',
//   Component: AuthCallback,
// },

{
      path: '/auth',
      Component: LoginScreen,
    },
    {
      path: '/auth/google/callback',    // ← keep this if Google redirects here
      Component: AuthCallback,
    },
    // or add this instead / in addition:
    {
      path: '/auth/callback',
      Component: AuthCallback,
    },


      {
        path: '/forgot-password',
        Component: ForgotPasswordScreen,
      },
      {
        path: '/reset-password',
        Component: ResetPasswordScreen,
      },
    ],
  },
  {
    path: '/verify-email/:token',
    Component: EmailVerificationScreen,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/username-setup',
        Component: UsernameSetupScreen,
      },
      {
        path: '/profile-setup',
        Component: ProfileSetupScreen,
      },
      {
        path: '/home',
        Component: HomeScreen,
      },
      {
        path: '/create',
        Component: CreatePredictionScreen,
      },
      {
        path: '/prediction/:id',
        Component: PredictionDetailScreen,
      },
      {
        path: '/profile',
        Component: ProfileScreen,
      },
      {
        path: '/leaderboard',
        Component: LeaderboardScreen,
      },
      {
        path: '/groups',
        Component: GroupsScreen,
      },
      {
        path: '/about',
        Component: AboutScreen,
      },
    ],
  },
]);