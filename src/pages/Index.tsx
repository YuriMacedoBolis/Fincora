import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";

const Index = () => {
  const { isPasswordRecovery, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPasswordRecovery) {
      navigate("/reset-password", { replace: true });
    }
  }, [isPasswordRecovery, navigate]);

  if (isPasswordRecovery) return null;

  return <Login />;
};

export default Index;
