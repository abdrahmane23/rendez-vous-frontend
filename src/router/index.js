import { createRouter, createWebHistory } from 'vue-router';
import keycloak from '../services/keycloak';

const routes = [
  {
    path: '/',
    name: 'Root',
    component: { render: () => null },
    beforeEnter: (to, from, next) => {
      if (!keycloak.authenticated) {
        keycloak.login();
      } else {
        // Traffic Control: Using hasRealmRole because your roles are in realm_access
        if (keycloak.hasRealmRole('ADMIN')) {
          next('/admin');
        } else if (keycloak.hasRealmRole('EXAMINER')) {
          next('/examiner');
        } else if (keycloak.hasRealmRole('PATIENT')) {
          next('/patient');
        } else {
          console.warn("User authenticated but no recognized App Roles found");
          next('/unauthorized');
        }
      }
    }
  },
  {
    path: '/patient',
    name: 'Patient',
    component: () => import('../views/PatientView.vue'),
    meta: { requiresAuth: true, role: 'PATIENT' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/examiner',
    name: 'Examiner',
    component: () => import('../views/ExaminerView.vue'),
    meta: { requiresAuth: true, role: 'EXAMINER' }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/Unauthorized.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global Security Guard
router.beforeEach((to, from, next) => {
  // If route doesn't require auth (like /unauthorized), let it through
  if (!to.meta.requiresAuth) {
    return next();
  }

  // If not authenticated, force Keycloak login
  if (!keycloak.authenticated) {
    keycloak.login();
    return;
  }

  // Check roles using hasRealmRole
  const requiredRole = to.meta.role;
  if (requiredRole && !keycloak.hasRealmRole(requiredRole)) {
    console.error(`Access Denied. Role ${requiredRole} missing from realm_access.`);
    next('/unauthorized');
  } else {
    next();
  }
});

export default router;