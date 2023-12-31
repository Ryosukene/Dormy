import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
import UserProfile from "./userProfile";
import { Center, Text, Button, Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";

type UserProfileType = {
  created_at: string;
  email: string | null;
  id: string;
  name: string | null;
  password: string | null;
  points: number | null;
};

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState(""); // State for the new name
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
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
    // userIdがundefinedの場合は処理を中断
    if (!userId) {
      console.error("Error: User ID is undefined.");
      return;
    }

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
  if (!session) {
    const handleGoHome = () => {
      router.push("/");
    };
    return (
      <Center height="100vh">
        <Stack spacing={4}>
          <Text fontSize="xl">You are not logged in</Text>
          <Button colorScheme="blue" onClick={handleGoHome}>
            Return to Home
          </Button>
        </Stack>
      </Center>
    );
  }
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
