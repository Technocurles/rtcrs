import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../../config/api";

export default function ProfileManagement() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
    } catch (error) {
      console.error("Error fetching profile");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile Management</h2>

      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Mobile:</strong> {user.mobile}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>DOB:</strong> {user.dateOfBirth?.substring(0,10)}</p>
      <p><strong>City:</strong> {user.address?.city}</p>
    </div>
  );
}
