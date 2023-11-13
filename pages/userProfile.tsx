import {
  Input,
  Editable,
  EditableInput,
  EditablePreview,
  ButtonGroup,
  IconButton,
  Flex,
  Box,
  Text,
  Avatar,
  Stack,
  Badge,
  useEditableControls,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
function CustomControlsExample({ user }: any) {
  const [userProfile, setUserProfile] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState(""); // State for the new name
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const userId = session?.user?.id;
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm">
        <IconButton
          aria-label="Confirm edit"
          icon={<CheckIcon />}
          {...getSubmitButtonProps()}
        />
        <IconButton
          aria-label="Cancel edit"
          icon={<CloseIcon />}
          {...getCancelButtonProps()}
        />
      </ButtonGroup>
    ) : (
      <IconButton
        aria-label="Edit"
        size="sm"
        icon={<EditIcon />}
        {...getEditButtonProps()}
      />
    );
  }

  const handleNameChange = (newName: any) => {
    setNewName(newName); // 編集された名前をステートに保存
  };
  const handleSubmit = async () => {
    const { error } = await supabase
      .from("users")
      .update({ name: newName }) // Replace 'name' with the actual field name
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user name:", error);
      return;
    }
  };
  return (
    <Editable
      textAlign="center"
      defaultValue={user.name}
      fontSize="2xl"
      fontWeight="bold"
      isPreviewFocusable={false}
      onChange={handleNameChange}
      onSubmit={handleSubmit}
    >
      <EditablePreview />
      <Input as={EditableInput} />
      <EditableControls />
    </Editable>
  );
}

export default function UserProfile(user: any) {
  return (
    <Flex align="center" justify="center" height="100vh">
      <Box
        width="300px"
        height="400px"
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        boxShadow="lg"
      >
        <Stack align="center" justify="center" spacing={4}>
          <Avatar size="xl" name={user.name} src={user.avatar} mt="7" />
          <Flex align="center">
            <CustomControlsExample user={user} />
          </Flex>
          <Text fontSize="md" color="gray.500" textAlign="center">
            {user.email}
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            ID: {user.id}
          </Text>
          <Badge px={2} py={1} colorScheme="teal" borderRadius="full">
            Points: {user.points}
          </Badge>
        </Stack>
      </Box>
    </Flex>
  );
}
