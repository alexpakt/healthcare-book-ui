import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import {PatientsList} from "../components/Doctor/PatientsList";

const DoctorAppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PatientsList />
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
