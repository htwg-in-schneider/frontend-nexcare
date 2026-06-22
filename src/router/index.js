import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '@/views/HomeView.vue'
import PatientList from '@/views/PatientList.vue'
import DashboardView from '@/views/DashboardView.vue'
import PatientDetail from '@/views/PatientDetail.vue'
import EditPatient from '@/views/EditPatient.vue'
import ImpressumView from '@/views/ImpressumView.vue'
import DatenschutzView from '@/views/DatenschutzView.vue'
import { useUserStore } from '@/stores/user.js'

/**
 * Ensure the backend profile is loaded before checking roles.
 * authGuard already confirmed the user is authenticated, so the
 * token is available when we call loadProfile here.
 */
async function ensureProfile() {
  const userStore = useUserStore()
  if (!userStore.loaded) await userStore.loadProfile()
  return userStore
}

/** Role guard: only staff (ARZT, KRANKENSCHWESTER, ADMIN). */
async function staffRoleGuard(to, from, next) {
  const userStore = await ensureProfile()
  if (userStore.isPatient) return next('/portal')
  next()
}

/** Role guard: only patients. */
async function patientRoleGuard(to, from, next) {
  const userStore = await ensureProfile()
  if (!userStore.isPatient) return next('/dashboard')
  next()
}

/** Role guard: only admin. */
async function adminRoleGuard(to, from, next) {
  const userStore = await ensureProfile()
  if (userStore.profile?.role === 'ADMIN') return next()
  return next(userStore.isPatient ? '/portal' : '/dashboard')
}

const routes = [
  { path: '/', name: 'home', component: HomeView },

  // Dashboard (nur für Staff)
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    beforeEnter: [authGuard, staffRoleGuard],
  },

  // Patientenportal (nur für Patienten)
  {
    path: '/portal',
    name: 'portal',
    component: () => import('@/views/PatientenPortalView.vue'),
    beforeEnter: [authGuard, patientRoleGuard],
  },
  {
    path: '/mein-medikamentenplan',
    name: 'mein-medikamentenplan',
    component: () => import('@/views/MeinMedikamentenplanView.vue'),
    beforeEnter: [authGuard, patientRoleGuard],
  },

  // Patientenliste & -verwaltung (nur Staff)
  {
    path: '/patients',
    name: 'patient-list',
    component: PatientList,
    beforeEnter: [authGuard, staffRoleGuard],
  },
  {
    path: '/patient/view/:id',
    name: 'patient-detail',
    component: PatientDetail,
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: [authGuard, staffRoleGuard],
  },
  {
    path: '/patient/edit/:id',
    name: 'patient-edit',
    component: EditPatient,
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: [authGuard, staffRoleGuard],
  },

  // Multi-Step Aufnahme (nur Staff)
  {
    path: '/aufnahme/1',
    name: 'aufnahme-1',
    component: () => import('@/views/admission/AdmissionStep1.vue'),
    beforeEnter: [authGuard, staffRoleGuard],
  },
  {
    path: '/aufnahme/2',
    redirect: '/aufnahme/3',
  },
  {
    path: '/aufnahme/3',
    name: 'aufnahme-3',
    component: () => import('@/views/admission/AdmissionStep3.vue'),
    beforeEnter: [authGuard, staffRoleGuard],
  },

  // Medikamentenplan (Staff)
  {
    path: '/patient/:patientId/medikamentenplan',
    name: 'medikamentenplan',
    component: () => import('@/views/MedikamentenplanView.vue'),
    props: (route) => ({ patientId: Number(route.params.patientId) }),
    beforeEnter: [authGuard, staffRoleGuard],
  },

  // Bettenverwaltung (nur Staff)
  {
    path: '/betten',
    name: 'betten',
    component: () => import('@/views/BettenView.vue'),
    beforeEnter: [authGuard, staffRoleGuard],
  },

  // Benutzerprofil (alle eingeloggten Nutzer)
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    beforeEnter: authGuard,
  },

  // Admin-Bereich
  {
    path: '/admin',
    redirect: '/dashboard',
  },
  {
    path: '/admin/klinika',
    name: 'admin-klinika',
    component: () => import('@/views/admin/KlinikumAdmin.vue'),
    beforeEnter: [authGuard, adminRoleGuard],
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UserAdmin.vue'),
    beforeEnter: [authGuard, adminRoleGuard],
  },
  {
    path: '/admin/medikamente',
    name: 'admin-medikamente',
    component: () => import('@/views/admin/MedikamentAdmin.vue'),
    beforeEnter: [authGuard, adminRoleGuard],
  },
  {
    path: '/aufnahme-antraege',
    name: 'aufnahme-antraege',
    component: () => import('@/views/AufnahmeAntraegeView.vue'),
    beforeEnter: [authGuard, staffRoleGuard],
  },
  {
    path: '/registrierung-info',
    name: 'registrierung-info',
    component: () => import('@/views/RegistrierungInfoView.vue'),
  },

  // Rechtliches
  { path: '/impressum', name: 'impressum', component: ImpressumView },
  { path: '/datenschutz', name: 'datenschutz', component: DatenschutzView },

  // Catch-all → Homepage
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
