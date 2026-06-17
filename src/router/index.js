import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '@/views/HomeView.vue'
import PatientList from '@/views/PatientList.vue'
import PatientDetail from '@/views/PatientDetail.vue'
import EditPatient from '@/views/EditPatient.vue'
import ImpressumView from '@/views/ImpressumView.vue'
import DatenschutzView from '@/views/DatenschutzView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },

  // Patientenliste (öffentlich lesbar)
  { path: '/patients', name: 'patient-list', component: PatientList },
  {
    path: '/patient/view/:id',
    name: 'patient-detail',
    component: PatientDetail,
    props: (route) => ({ id: Number(route.params.id) }),
  },

  // Bearbeiten erfordert Login
  {
    path: '/patient/edit/:id',
    name: 'patient-edit',
    component: EditPatient,
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: authGuard,
  },

  // Multi-Step Aufnahme (3 Schritte)
  {
    path: '/aufnahme/1',
    name: 'aufnahme-1',
    component: () => import('@/views/admission/AdmissionStep1.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/aufnahme/2',
    name: 'aufnahme-2',
    component: () => import('@/views/admission/AdmissionStep2.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/aufnahme/3',
    name: 'aufnahme-3',
    component: () => import('@/views/admission/AdmissionStep3.vue'),
    beforeEnter: authGuard,
  },

  // Benutzerprofil
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    beforeEnter: authGuard,
  },

  // Admin-Bereich
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/admin/klinika',
    name: 'admin-klinika',
    component: () => import('@/views/admin/KlinikumAdmin.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UserAdmin.vue'),
    beforeEnter: authGuard,
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
