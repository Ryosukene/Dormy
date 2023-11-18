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

export default function CreateGroupModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState("");
  const [errorText, setErrorText] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const userId = session?.user.id;
  const handleSave = async () => {
    await createGroup(newGroupName);
    onClose(); // createGroup関数の実行後にモーダルを閉じる
  };
  const createGroup = async (groupName: string) => {
    const { data: groupData, error: groupDataError } = await supabase
      .from("groups")
      .insert([{ group_name: groupName }]);
    if (groupDataError) {
      console.error("Error creating group:", groupDataError);
      return null;
    }

    const { data: newGroupId, error: newGroupIdError } = await supabase
      .from("groups")
      .select("id")
      .eq("group_name", groupName);
    if (newGroupIdError) {
      console.error("Error creating group:", newGroupIdError);
      return null;
    }
    console.log("user.id", userId);
    console.log("newGroupId", newGroupId);
    const { error: memberError } = await supabase
      .from("group_members")
      .insert([{ user_id: userId, group_id: newGroupId[0].id }]);

    if (memberError) {
      console.error("Error adding user to group:", memberError);
      return null;
    }
    if (!memberError) {
      onClose();
    }
  };
  return (
    <>
      <Button onClick={onOpen}>Create Group</Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Room Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Room Name"
                value={newGroupName}
                onChange={(e) => {
                  setErrorText("");
                  setNewGroupName(e.target.value);
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
                createGroup(newGroupName);
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
