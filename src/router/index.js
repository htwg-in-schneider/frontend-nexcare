import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PatientList from '@/views/PatientList.vue';
import PatientDetail from '@/views/PatientDetail.vue';
import CreatePatient from '@/views/CreatePatient.vue';
import EditPatient from '@/views/EditPatient.vue';
import ImpressumView from '@/views/ImpressumView.vue';
import DatenschutzView from '@/views/DatenschutzView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/patients', name: 'patient-list', component: PatientList },
  { path: '/patient/create', name: 'patient-create', component: CreatePatient },
  {
    path: '/patient/view/:id',
    name: 'patient-detail',
    component: PatientDetail,
    props: (route) => ({ id: Number(route.params.id) }),
  },
  {
    path: '/patient/edit/:id',
    name: 'patient-edit',
    component: EditPatient,
    props: (route) => ({ id: Number(route.params.id) }),
  },
  { path: '/impressum', name: 'impressum', component: ImpressumView },
  { path: '/datenschutz', name: 'datenschutz', component: DatenschutzView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
