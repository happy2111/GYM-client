import { useAuth } from '../context/AuthContext.jsx'
const Home = () => {
  const { accessToken } = useAuth();
  console.log(accessToken);
  return (
    <div>
  Home
    </div>
  );
};

export default Home;