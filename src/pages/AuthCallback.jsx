import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/axiosInstance";
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // post refresh token to backend to get access token
    const fetchAccessToken = async () => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true });
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        navigate("/profile");
      }catch (error) {
        console.error("Error fetching access token:", error);
        navigate("/login");
      }
    }
    fetchAccessToken();
  }, [navigate, searchParams, setAccessToken]);

  return <p>Logging you in...</p>;
}
