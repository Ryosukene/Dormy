"use client";
import { Database } from "@/lib/schema";
import { Session, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import InitialFocus from "./CreateGroup";
import CreateGroupModal from "./CreateGroup";
import AddNewMemberModal from "./AddNewMember";

// type Todos = Database["public"]["Tables"]["todos"]["Row"];
type Todos = Database["public"]["Tables"]["todos_group"]["Row"];
export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const [todos, setTodos] = useState<Todos[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [errorText, setErrorText] = useState("");
  const [userTable, setUserTable] = useState();
  const user = session.user;
  const userId = session.user.id;
  useEffect(() => {
    const fetchTodos = async () => {
      const groupId = await getGroupIdsByUserId(user.id);
      const { data: todos, error } = await supabase
        .from("todos_group")
        .select("*")
        .eq("group_id", groupId[0])
        .order("id", { ascending: true });

      if (error) {
        console.log("error/useEffect", error);
      } else {
        console.log("todos", todos);
        setTodos(todos);
      }
    };

    fetchTodos();
  }, [supabase, user.id]);

  const addTodo = async (taskText: string) => {
    // groupIdがUUIDの配列を返すと仮定して、一つのIDを取得する
    const groupIds = await getGroupIdsByUserId(user.id);
    const groupId = groupIds.length > 0 ? groupIds[0] : null; // 配列の最初の要素を使用

    let task = taskText.trim();
    if (task.length && groupId) {
      // groupIdがnullでないことを確認
      const { data: todo, error } = await supabase
        .from("todos_group")
        .insert({ task: task, group_id: groupId }) // 単一のUUIDを使用
        .select()
        .single();

      if (error) {
        setErrorText(error.message);
      } else {
        setTodos([...todos, todo]);
        setNewTaskText("");
      }
    }
  };

  const deleteTodo = async (id: string) => {
    console.log("deleteTodo/id", id);
    try {
      await supabase.from("todos_group").delete().eq("id", id).throwOnError();
      setTodos(todos.filter((x) => x.id != id));
    } catch (error) {
      console.log("error/deleteTodo", error);
    }
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
    console.log("user.id", user.id);
    console.log("newGroupId", newGroupId);
    const { error: memberError } = await supabase
      .from("group_members")
      .insert([{ user_id: user.id, group_id: newGroupId[0].id }]);

    if (memberError) {
      console.error("Error adding user to group:", memberError);
      return null;
    }
  };
  const addUserToGroup = async (newMemberId: string) => {
    if (user.id === null) {
      console.error("Error: User ID is null.");
      return;
    }
    const groupId = await getGroupIdsByUserId(user.id);
    console.log("groupId", groupId[0]);
    console.log("newMemberId", newMemberId);
    console.log("userId", user.id);

    const { data, error } = await supabase
      .from("group_members")
      .insert([{ user_id: newMemberId, group_id: groupId[0] }]);
    console.log(data);
    if (error) {
      console.error("Error adding user to group:", error);
      return null;
    }
  };
  const emailToId = async (email: string) => {
    const { data, error } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single();

    console.log("email/emailToId", email);
    console.log("data/emailToId", data);

    if (error) {
      console.error("Error email to userId:", error);
      return null;
    }

    return data ? data.id : null; // データがあればIDを返し、なければnullを返す
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

  async function fetchUserTable() {
    const getUserByUserId = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId);

      if (error) {
        console.error("Error fetching user table:", error);
        return [];
      }
      return data;
    };
    try {
      const data = await getUserByUserId(user.id);
      console.log("data[0]", data[0]); // userTableにはデータが入っているはずです
      setUserTable(data[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }
  // コンポーネントがマウントされたらユーザーデータを取得
  useEffect(() => {
    fetchUserTable();
  }, [user, todos]); // userIdが変更されたら再度実行
  return (
    <div className="w-full">
      <h1 className="mb-6">Tasks</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(newTaskText);
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="Clean Bathroom"
          value={newTaskText}
          onChange={(e) => {
            setErrorText("");
            setNewTaskText(e.target.value);
          }}
        />
        <button className="btn-black" type="submit">
          Add
        </button>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {todos.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              user={user}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
        </ul>
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <CreateGroupModal />
        <AddNewMemberModal />
      </div>
    </div>
  );
}
interface TodoProps {
  todo: Todos;
  onDelete: () => void;
  user: any; // ここでUser型のuserプロパティを追加
}
const Todo: React.FC<TodoProps> = ({ todo, onDelete, user }) => {
  const supabase = useSupabaseClient<Database>();
  const [isCompleted, setIsCompleted] = useState(todo.is_complete);
  const incrementPoint = async () => {
    const userId = user.id;
    // 現在のポイントを取得
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("points")
      .eq("id", userId)
      .single();
    console.log("incrementPoint/userId", userId);

    if (getUserError) {
      console.error("Error getting user points:", getUserError);
      return; // エラーがあれば処理を中断
    }

    // 現在のポイントに1加算
    const currentPoints = userData.points ?? 0; // nullまたはundefinedの場合は0とする
    const updatedPoints = currentPoints + 1;

    // ポイントを更新
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ points: updatedPoints })
      .eq("id", userId);

    if (updateUserError) {
      console.error("Error updating user points:", updateUserError);
    } else {
      console.log("Updated user points successfully to:", updatedPoints);
    }
  };
  const decrementPoint = async () => {
    const userId = user.id;
    // 現在のポイントを取得
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("points")
      .eq("id", userId)
      .single();

    if (getUserError) {
      console.error("Error getting user points:", getUserError);
      return; // エラーがあれば処理を中断
    }

    // 現在のポイントに1加算
    const currentPoints = userData.points ?? 0; // nullまたはundefinedの場合は0とする
    const updatedPoints = currentPoints - 1;

    // ポイントを更新
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ points: updatedPoints })
      .eq("id", userId);

    if (updateUserError) {
      console.error("Error updating user points:", updateUserError);
    } else {
      console.log("Updated user points successfully to:", updatedPoints);
    }
  };

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from("todos_group")
        .update({ is_complete: !isCompleted })
        .eq("id", todo.id)
        .throwOnError()
        .select()
        .single();

      if (data) setIsCompleted(data.is_complete);
      console.log("Todo/is_complete", isCompleted);
      // await incrementPoint();
      if (!isCompleted) await incrementPoint();
      else await decrementPoint();
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <li className="w-full block cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">
            {todo.task}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => toggle()}
            type="checkbox"
            checked={isCompleted ? true : false}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="gray"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  );
};

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
);
function incrementPoint() {
  throw new Error("Function not implemented.");
}
