import { useUser as useUserContext } from "../../store/userStore";

export const useUser = () => {
  return useUserContext();
};