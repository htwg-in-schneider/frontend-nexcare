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

/** Guard: only for staff (ARZT, KRANKENSCHWESTER, ADMIN). Patients are redirected to /portal. */
async function staffGuard(to, from, next) {
  await authGuard(to, from, next)
  const userStore = useUserStore()
  if (userStore.profile && userStore.isPatient) {
    return next('/portal')
  }
  next()
}

/** Guard: only for patients. Staff are redirected to /dashboard. */
async function patientGuard(to, from, next) {
  await authGuard(to, from, next)
  const userStore = useUserStore()
  if (userStore.profile && !userStore.isPatient) {
    return next('/dashboard')
  }
  next()
}

/** Guard: only for admin. Non-admins are redirected. */
async function adminGuard(to, from, next) {
  await authGuard(to, from, next)
  const userStore = useUserStore()
  if (userStore.profile?.role === 'ADMIN') return next()
  if (userStore.isPatient) return next('/portal')
  return next('/dashboard')
}

const routes = [
  { path: '/', name: 'home', component: HomeView },

  // Dashboard (nur für Staff)
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    beforeEnter: staffGuard,
  },

  // Patientenportal (nur für Patienten)
  {
    path: '/portal',
    name: 'portal',
    component: () => import('@/views/PatientenPortalView.vue'),
    beforeEnter: patientGuard,
  },
  {
    path: '/mein-medikamentenplan',
    name: 'mein-medikamentenplan',
    component: () => import('@/views/MeinMedikamentenplanView.vue'),
    beforeEnter: patientGuard,
  },

  // Patientenliste & -verwaltung (nur Staff)
  {
    path: '/patients',
    name: 'patient-list',
    component: PatientList,
    beforeEnter: staffGuard,
  },
  {
    path: '/patient/view/:id',
    name: 'patient-detail',
    component: PatientDetail,
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: staffGuard,
  },
  {
    path: '/patient/edit/:id',
    name: 'patient-edit',
    component: EditPatient,
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: staffGuard,
  },

  // Multi-Step Aufnahme (nur Staff)
  {
    path: '/aufnahme/1',
    name: 'aufnahme-1',
    component: () => import('@/views/admission/AdmissionStep1.vue'),
    beforeEnter: staffGuard,
  },
  {
    path: '/aufnahme/2',
    name: 'aufnahme-2',
    component: () => import('@/views/admission/AdmissionStep2.vue'),
    beforeEnter: staffGuard,
  },
  {
    path: '/aufnahme/3',
    name: 'aufnahme-3',
    component: () => import('@/views/admission/AdmissionStep3.vue'),
    beforeEnter: staffGuard,
  },

  // Medikamentenplan (Staff: verwaltend; Patient: eigener Plan über /mein-medikamentenplan)
  {
    path: '/patient/:patientId/medikamentenplan',
    name: 'medikamentenplan',
    component: () => import('@/views/MedikamentenplanView.vue'),
    props: (route) => ({ patientId: Number(route.params.patientId) }),
    beforeEnter: staffGuard,
  },

  // Bettenverwaltung (nur Staff)
  {
    path: '/betten',
    name: 'betten',
    component: () => import('@/views/BettenView.vue'),
    beforeEnter: staffGuard,
  },

  // Benutzerprofil (alle eingeloggten Nutzer)
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    beforeEnter: authGuard,
  },

  // Admin-Bereich (kein separates Admin-Dashboard)
  {
    path: '/admin',
    redirect: '/dashboard',
  },
  {
    path: '/admin/klinika',
    name: 'admin-klinika',
    component: () => import('@/views/admin/KlinikumAdmin.vue'),
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UserAdmin.vue'),
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/medikamente',
    name: 'admin-medikamente',
    component: () => import('@/views/admin/MedikamentAdmin.vue'),
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/einstellungen',
    name: 'admin-einstellungen',
    component: () => import('@/views/admin/EinstellungenAdmin.vue'),
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/email-log',
    name: 'admin-email-log',
    component: () => import('@/views/admin/EmailLogAdmin.vue'),
    beforeEnter: adminGuard,
  },
  {
    path: '/aufnahme-antraege',
    name: 'aufnahme-antraege',
    component: () => import('@/views/AufnahmeAntraegeView.vue'),
    beforeEnter: staffGuard,
  },
  {
    path: '/registrierung-info',
    name: 'registrierung-info',
    component: () => import('@/views/RegistrierungInfoView.vue'),
  },

  // Rechtliches
  { path: '/impressum', name: 'impressum', component: ImpressumView },
  { path: '/datenschutz', name: 'datenschutz', component: DatenschutzView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
