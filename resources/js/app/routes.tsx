// import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { SplashScreen } from '@/app/screens/SplashScreen';
// import LoginScreen from '@/app/screens/LoginScreen';
// import { UsernameSetupScreen } from '@/app/screens/UsernameSetupScreen';
// import { HomeScreen } from '@/app/screens/HomeScreen';
// import { CreatePredictionScreen } from '@/app/screens/CreatePredictionScreen';
// import { PredictionDetailScreen } from '@/app/screens/PredictionDetailScreen';
// import { ProfileScreen } from '@/app/screens/ProfileScreen';
// import { LeaderboardScreen } from '@/app/screens/LeaderboardScreen';
// import { GroupsScreen } from '@/app/screens/GroupsScreen';
// import { GroupDetailScreen } from '@/app/screens/GroupDetailScreen';
// import { AboutScreen } from '@/app/screens/AboutScreen';
// import { ProtectedRoute } from '@/app/components/ProtectedRoute';
// import { AdminGuard } from '@/app/components/AdminGuard';
// import { AdminDashboardScreen } from '@/app/screens/AdminDashboardScreen';
// import { PublicRoute } from '@/app/components/PublicRoute';
// import { AuthCallback } from '@/app/screens/AuthCallback';
// import { ProfileSetupScreen } from '@/app/screens/ProfileSetupScreen';
// import { EmailVerificationScreen } from '@/app/screens/EmailVerificationScreen';
// import { PollScreen } from '@/app/screens/PollScreen';
// import { PollDetailScreen } from '@/app/screens/PollDetailScreen';

// import { ForgotPasswordScreen } from '@/app/screens/ForgotPasswordScreen';
// import { ResetPasswordScreen } from '@/app/screens/ResetPasswordScreen';

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     errorElement: <div className="p-8 text-center bg-black text-white h-screen flex flex-col items-center justify-center">
//       <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
//       <p className="text-gray-400 mb-8">We couldn't find the page you're looking for or an unexpected error occurred.</p>
//       <a href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold">Back to Login</a>
//     </div>,
//     children: [
//       {
//         path: "/login",
//         element: <LoginScreen />,
//       },
//       {
//         path: '/',
//         element: <Navigate to="/splash" replace />,
//       },
//       {
//         path: '/splash',
//         Component: SplashScreen,
//       },
//       {
//         element: <PublicRoute />,
//         children: [
          
//           {
//             path: '/auth',
//             Component: LoginScreen,
//           },
//           {
//             path: '/auth/google/callback',    // ← keep this if Google redirects here
//             Component: AuthCallback,
//           },
//           // or add this instead / in addition:
//           {
//             path: '/auth/callback',
//             Component: AuthCallback,
//           },


//           {
//             path: '/forgot-password',
//             Component: ForgotPasswordScreen,
//           },
//           {
//             path: '/reset-password',
//             Component: ResetPasswordScreen,
//           },
//         ],
//       },
//       {
//         path: '/verify-email/:token',
//         Component: EmailVerificationScreen,
//       },
//       {
//         element: <ProtectedRoute />,
//         children: [
//           {
//             path: '/username-setup',
//             Component: UsernameSetupScreen,
//           },
//           {
//             path: '/profile-setup',
//             Component: ProfileSetupScreen,
//           },
//           {
//             path: '/home',
//             Component: HomeScreen,
//           },
//           {
//             path: '/create',
//             Component: CreatePredictionScreen,
//           },
//           {
//             path: '/prediction/:id',
//             Component: PredictionDetailScreen,
//           },
//           {
//             path: '/poll/:id',
//             Component: PollDetailScreen,
//           },
//           {
//             path: '/polls',
//             Component: PollScreen,
//           },
//           {
//             path: '/create-poll',
//             Component: CreatePredictionScreen,
//           },
//           {
//             path: '/profile',
//             Component: ProfileScreen,
//           },
//           {
//             path: '/leaderboard',
//             Component: LeaderboardScreen,
//           },
//           {
//             path: '/groups',
//             Component: GroupsScreen,
//           },
//           {
//             path: '/groups/:id',
//             Component: GroupDetailScreen,
//           },
//           {
//             path: '/about',
//             Component: AboutScreen,
//           },

//           {
//             element: <AdminGuard />,
//             children: [
//               {
//                 path: '/admin',
//                 Component: AdminDashboardScreen,
//               },
//             ],
//           },
//         ],
//       },
//     ]
//   }
// ]);


// router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

// ────────────────────────────────────────────────
// Public / Auth-related screens (no auth required)
// ────────────────────────────────────────────────
import { SplashScreen } from '@/app/screens/SplashScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import { ForgotPasswordScreen } from '@/app/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/app/screens/ResetPasswordScreen';
import { EmailVerificationScreen } from '@/app/screens/EmailVerificationScreen';
import { AuthCallback } from '@/app/screens/AuthCallback';

// ────────────────────────────────────────────────
// Protected user screens (require authentication)
// ────────────────────────────────────────────────
import { UsernameSetupScreen } from '@/app/screens/UsernameSetupScreen';
import { ProfileSetupScreen } from '@/app/screens/ProfileSetupScreen';
import { HomeScreen } from '@/app/screens/HomeScreen';
import { CreatePredictionScreen } from '@/app/screens/CreatePredictionScreen';
import { PredictionDetailScreen } from '@/app/screens/PredictionDetailScreen';
import { PollScreen } from '@/app/screens/PollScreen';
import { PollDetailScreen } from '@/app/screens/PollDetailScreen';
import { ProfileScreen } from '@/app/screens/ProfileScreen';
import { LeaderboardScreen } from '@/app/screens/LeaderboardScreen';
import { GroupsScreen } from '@/app/screens/GroupsScreen';
import { GroupDetailScreen } from '@/app/screens/GroupDetailScreen';
import { AboutScreen } from '@/app/screens/AboutScreen';

// ────────────────────────────────────────────────
// Admin screens & guards
// ────────────────────────────────────────────────
import { AdminGuard } from '@/app/components/AdminGuard';
import { AdminDashboardScreen } from '@/app/screens/AdminDashboardScreen';

// ────────────────────────────────────────────────
// Route Guards / Layouts
// ────────────────────────────────────────────────
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you are looking for does not exist or an unexpected error occurred.
        </p>
        <a
          href="/home"
          className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </a>
      </div>
    ),

    children: [
      // ────────────────────────────────────────────────
      // Public routes – no authentication needed
      // ────────────────────────────────────────────────
      {
        path: 'splash',
        Component: SplashScreen,
      },
      {
        path: 'login',
        Component: LoginScreen,
      },
      {
        path: 'auth',
        Component: LoginScreen,
      },
      {
        path: 'forgot-password',
        Component: ForgotPasswordScreen,
      },
      {
        path: 'reset-password',
        Component: ResetPasswordScreen,
      },
      {
        path: 'verify-email/:token',
        Component: EmailVerificationScreen,
      },

      // Google OAuth / social login callbacks
      {
        path: 'auth/google/callback',
        Component: AuthCallback,
      },
      {
        path: 'auth/callback',
        Component: AuthCallback,
      },

      // ────────────────────────────────────────────────
      // Protected routes – require authentication
      // ────────────────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          // Onboarding / setup flows
          {
            path: 'username-setup',
            Component: UsernameSetupScreen,
          },
          {
            path: 'profile-setup',
            Component: ProfileSetupScreen,
          },

          // Main app routes
          {
            path: 'home',
            Component: HomeScreen,
          },
          {
            path: '',
            element: <Navigate to="/home" replace />,
          },

          // Prediction & Poll creation / detail
          {
            path: 'create',
            Component: CreatePredictionScreen,
          },
          {
            path: 'create-poll',
            Component: CreatePredictionScreen, // ← assuming same component for now
          },
          {
            path: 'prediction/:id',
            Component: PredictionDetailScreen,
          },
          {
            path: 'poll/:id',
            Component: PollDetailScreen,
          },
          {
            path: 'polls',
            Component: PollScreen,
          },

          // Profile & social
          {
            path: 'profile',
            Component: ProfileScreen,
          },
          {
            path: 'leaderboard',
            Component: LeaderboardScreen,
          },
          {
            path: 'groups',
            Component: GroupsScreen,
          },
          {
            path: 'groups/:id',
            Component: GroupDetailScreen,
          },

          // Static / info
          {
            path: 'about',
            Component: AboutScreen,
          },
        ],
      },

      // ────────────────────────────────────────────────
      // Admin section – completely separated & protected
      // ────────────────────────────────────────────────
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          {
            index: true,
            Component: AdminDashboardScreen,
          },

          // ── Add future admin sub-routes here ──
          // {
          //   path: 'users',
          //   Component: AdminUsersScreen,
          // },
          // {
          //   path: 'predictions',
          //   Component: AdminPredictionsScreen,
          // },
          // {
          //   path: 'polls',
          //   Component: AdminPollsScreen,
          // },
          // {
          //   path: 'groups',
          //   Component: AdminGroupsScreen,
          // },
          // {
          //   path: 'stats',
          //   Component: AdminStatsScreen,
          // },
        ],
      },
    ],
  },
]);