import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import {PatientsList} from "../components/Doctor/PatientsList";
import { useDoctorAssignedChildren } from '../hooks/useDoctorData';

const DoctorAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: patients, loading: isLoading } = useDoctorAssignedChildren();

  const handleViewHistory = (childId: number) => {
    navigate(`/patients/${childId}`);
  };

  return (
    <DashboardLayout>
      <PatientsList patients={patients || null} isLoading={isLoading} onViewHistory={handleViewHistory} />
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
