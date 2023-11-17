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
    // userIdがnullまたはundefinedの場合、処理を中止
    if (!userId) {
      console.error("Error: User ID is null or undefined.");
      return;
    }

    // 以降のコードはuserIdが有効な場合のみ実行される
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
              <FormLabel>New Member ID</FormLabel>
              <Input
                ref={initialRef}
                placeholder="New Member ID"
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
