import { createRouter, createWebHistory } from 'vue-router';
import PatientList from '@/views/PatientList.vue';
import PatientDetail from '@/views/PatientDetail.vue';
import CreatePatient from '@/views/CreatePatient.vue';
import EditPatient from '@/views/EditPatient.vue';

const routes = [
  { path: '/', name: 'patient-list', component: PatientList },
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
