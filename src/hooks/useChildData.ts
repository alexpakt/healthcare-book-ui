import { useApi, useMutation } from './useApi';
import { childService, type CreateChildRequest } from '../services/childService';
import { childHealthRecordService } from '../services/childHealthRecordService';

export function useChildren() {
  return useApi(() => childService.getMyChildren(), []);
}

export function useChild(childId: number) {
  return useApi(() => childService.getById(childId), [childId]);
}

export function useChildDoctors(childId?: number) {
  return useApi(() => childService.getChildDoctors(childId!), [childId], { skip: childId === undefined });
}

export function useUnassignDoctor() {
  return useMutation((payload?: { childId: number; doctorId: number }) =>
    childService.unassignDoctor(payload!.childId, payload!.doctorId)
  );
}

export function useCreateChild() {
  return useMutation((childData?: CreateChildRequest) =>
    childService.createChild(childData!)
  );
}

export function useUpdateChild() {
  return useMutation((payload?: { childId: number; data: CreateChildRequest }) =>
    childService.updateChild(payload!.childId, payload!.data)
  );
}

export function useDeleteChild() {
  return useMutation((childId?: number) =>
    childService.deleteChild(childId!)
  );
}

export function useChildGrowthMeasurements(childId: number) {
  return useApi(() => childHealthRecordService.getGrowthMeasurements(childId), [childId]);
}

export function useChildBirthRecord(childId: number) {
  return useApi(() => childHealthRecordService.getBirthRecord(childId), [childId]);
}

export function useChildVaccinations(childId: number) {
  return useApi(() => childHealthRecordService.getVaccinations(childId), [childId]);
}

export function useChildMedicalRecords(childId: number) {
  return useApi(() => childHealthRecordService.getMedicalRecords(childId), [childId]);
}

export function useChildAllergies(childId: number) {
  return useApi(() => childHealthRecordService.getAllergies(childId), [childId]);
}

export function useSearchChildByAmka() {
  return useMutation((amka?: string) => childService.searchByAmka(amka!));
}

export function useGrowthReferenceCurves(
  childId: number | undefined,
  measurementType: string
) {
  const skip = !childId;
  return useApi(
    () => childHealthRecordService.getGrowthReferenceCurves(childId!, measurementType),
    [childId, measurementType],
    { skip }
  );
}
