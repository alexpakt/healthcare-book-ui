import { useMutation } from './useApi';
import { childService, type CreateChildRequest } from '../services/childService';

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
