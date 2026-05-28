import { createRouter, createWebHistory } from 'vue-router';
import keycloak from '../services/keycloak';

const getRoles = () => {
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const clientRoles = keycloak.tokenParsed?.resource_access?.['rendezvous-frontend']?.roles || [];

  return [...new Set([...realmRoles, ...clientRoles])];
};

const hasRole = (role) => getRoles().includes(role);

const routes = [
  {
    path: '/login',
    redirect: '/'
  },
  {
    path: '/',
    name: 'Root',
    component: { render: () => null },
    beforeEnter: (to, from, next) => {
      if (!keycloak.authenticated) {
        keycloak.login();
      } else {
        // Traffic Control: Using hasRealmRole because your roles are in realm_access
        if (hasRole('admin')) {
          next('/admin');
        } else if (hasRole('examiner')) {
          next('/examiner');
        } else if (hasRole('patient')) {
          next('/patient');
        } else {
          console.warn('User authenticated but no recognized App Roles found', getRoles());
          next('/unauthorized');
        }
      }
    }
  },
  {
    path: '/patient',
    name: 'Patient',
    component: () => import('../views/PatientView.vue'),
    meta: { requiresAuth: true, role: 'patient' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/examiner',
    name: 'Examiner',
    component: () => import('../views/ExaminerView.vue'),
    meta: { requiresAuth: true, role: 'examiner' }
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
  if (requiredRole && !hasRole(requiredRole)) {
    console.error(`Access Denied. Role ${requiredRole} missing from token.`, getRoles());
    next('/unauthorized');
  } else {
    next();
  }
});

export default router;
