import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
import UserProfile from "./userProfile";
const Profile = () => {
  const [userProfile, setUserProfile] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState(""); // State for the new name
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      fetchUserByUserId(userId);
    }
  }, [userId]);

  const fetchUserByUserId = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId);

    if (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
      return;
    }
    setUserProfile(data);
    setIsLoading(false);
  };

  const handleNameChange = async () => {
    const { error } = await supabase
      .from("users")
      .update({ name: newName }) // Replace 'name' with the actual field name
      .eq("id", userId);

    if (error) {
      console.error("Error updating user name:", error);
      return;
    }
    setIsEditMode(false);
    fetchUserByUserId(userId); // Fetch updated data
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        userProfile?.map((entry, index) => (
          <div key={index}>
            {isEditMode ? (
              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={handleNameChange}>Save</button>
              </div>
            ) : (
              <div>
                <UserProfile
                  name={entry.name}
                  email={entry.email}
                  id={entry.id}
                  points={entry.points}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
