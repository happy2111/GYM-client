import { useAuth } from '../context/AuthContext.jsx'
import {useEffect} from "react";


const Profile = () => {
  const { user } = useAuth();
  useEffect(() => {console.log(user)}, [user]);
  return (
    <div>
      <h1>Profile Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Profile;