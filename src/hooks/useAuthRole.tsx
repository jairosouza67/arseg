import { useAuth } from "@/contexts/AuthContext";

export const useAuthRole = () => {
  return useAuth();
};
