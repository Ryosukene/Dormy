import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
{
  /* <form
  onSubmit={(e) => {
    e.preventDefault();
    addUserToGroup(newMemberId);
  }}
  className="flex gap-2 my-2"
>
  <input
    className="rounded w-full p-2"
    type="text"
    placeholder="Enter the ID of a new member"
    value={newMemberId}
    onChange={(e) => {
      setErrorText("");
      setNewMemberId(e.target.value);
    }}
  />
  <button className="btn-black" type="submit">
    Add to the group
  </button>
</form>; */
}

export default function AddNewMemberModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newMemberId, setNewMemberId] = useState("");
  const [errorText, setErrorText] = useState("");
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const userId = session?.user.id;
  const handleSave = async () => {
    // await addUserToGroup(newMemberId);
    onClose(); // createGroup関数の実行後にモーダルを閉じる
  };
  const getGroupIdsByUserId = async (userId: string) => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching group ids:", error);
      return [];
    }
    console.log("data/getGroupIdsByUserId", data);
    // group_idのみの配列を返す
    return data.map((entry) => entry.group_id);
  };

  const addUserToGroup = async (newMemberId: string) => {
    if (userId === null) {
      console.error("Error: User ID is null.");
      return;
    }
    const groupId = await getGroupIdsByUserId(userId);
    console.log("groupId", groupId[0]);
    console.log("newMemberId", newMemberId);
    console.log("userId", userId);

    const { data, error } = await supabase
      .from("group_members")
      .insert([{ user_id: newMemberId, group_id: groupId[0] }]);
    console.log(data);
    if (error) {
      console.error("Error adding user to group:", error);
      return null;
    }
    if (!error) {
      handleSave();
    }
  };
  return (
    <>
      <Button onClick={onOpen}>Add New Member</Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder="New Member Name"
                value={newMemberId}
                onChange={(e) => {
                  setErrorText("");
                  setNewMemberId(e.target.value);
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={(e) => {
                e.preventDefault();
                addUserToGroup(newMemberId);
              }}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
