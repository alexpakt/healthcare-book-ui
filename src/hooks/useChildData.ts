import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { childService, type CreateChildRequest } from '../services/childService';
import { childHealthRecordService } from '../services/childHealthRecordService';

export function useChildren() {
  const fetchFn = useCallback(() => childService.getMyChildren(), []);
  return useApi(fetchFn);
}

export function useChild(childId: number) {
  const fetchFn = useCallback(() => childService.getById(childId), [childId]);
  return useApi(fetchFn);
}

export function useChildDoctors(childId?: number) {
  const fetchFn = useCallback(() => childService.getChildDoctors(childId!), [childId]);
  return useApi(fetchFn, undefined, { skip: childId === undefined });
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
  const fetchFn = useCallback(() => childHealthRecordService.getGrowthMeasurements(childId), [childId]);
  return useApi(fetchFn);
}

export function useChildBirthRecord(childId: number) {
  const fetchFn = useCallback(() => childHealthRecordService.getBirthRecord(childId), [childId]);
  return useApi(fetchFn);
}

export function useChildVaccinations(childId: number) {
  const fetchFn = useCallback(() => childHealthRecordService.getVaccinations(childId), [childId]);
  return useApi(fetchFn);
}

export function useChildMedicalRecords(childId: number) {
  const fetchFn = useCallback(() => childHealthRecordService.getMedicalRecords(childId), [childId]);
  return useApi(fetchFn);
}

export function useChildAllergies(childId: number) {
  const fetchFn = useCallback(() => childHealthRecordService.getAllergies(childId), [childId]);
  return useApi(fetchFn);
}

export function useSearchChildByAmka() {
  return useMutation((amka?: string) => childService.searchByAmka(amka!));
}

export function useGrowthReferenceCurves(
  childId: number | undefined,
  measurementType: string
) {
  const skip = !childId;
  const fetchFn = useCallback(
    () => childHealthRecordService.getGrowthReferenceCurves(childId!, measurementType),
    [childId, measurementType]
  );
  return useApi(fetchFn, undefined, { skip });
}
