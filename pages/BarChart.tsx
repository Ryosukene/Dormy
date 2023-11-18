import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/schema";
import "chart.js/auto";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
type UserInfoType = {
  userId: string;
  points: number;
  name: string;
};
import {
  Center,
  Text,
  Button,
  Stack,
  Box,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[]; // Replace 'any' with a more specific type as needed
}
const CustomBarChart = () => {
  const [groupIds, setGroupIds] = useState<(string | null)[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoType[]>([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const router = useRouter();

  const fetchGroupIdsByUserId = async (userId: string) => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching group ids:", error);
      return [];
    }
    return data.map((entry) => entry.group_id);
  };

  // const fetchUserInfoByGroupId = async (groupId: string | null) => {
  //   // groupIdがnullの場合は処理を中止
  //   if (groupId === null) {
  //     console.error("Error: Group ID is null.");
  //     return []; // 空の配列を返して処理を中止
  //   }

  //   // groupIdがnullでないと確認された後、クエリを実行
  //   const { data, error } = await supabase
  //     .from("group_members")
  //     .select("user_id, users(*)")
  //     .eq("group_id", groupId);

  //   if (error) {
  //     console.error("Error fetching user points by group id:", error);
  //     return []; // エラー時は空の配列を返す
  //   }
  //   console.log("UserInfo", data);

  //   return data.map((entry) => {
  //     if (entry.users === null) {
  //       return {
  //         userId: entry.user_id || "Unknown",
  //         points: 0,
  //         name: "Unknown",
  //       };
  //     }

  //     return {
  //       userId: entry.users.id,
  //       points: entry.users.points || 0,
  //       name: entry.users.name || entry.users.id.slice(0, 5) + "...",
  //     };
  //   });
  // };
  const fetchUserInfoByGroupId = async (groupId: string | null) => {
    // groupIdがnullの場合は処理を中止
    if (groupId === null) {
      console.error("Error: Group ID is null.");
      return []; // 空の配列を返して処理を中止
    }

    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, users(*)")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching user points by group id:", error);
      return []; // エラー時は空の配列を返す
    }
    const { data: groupNameData, error: errorGroupName } = await supabase
      .from("groups")
      .select("group_name")
      .eq("id", groupId);

    if (errorGroupName) {
      console.error("Error fetching group name by group id:", errorGroupName);
      return []; // エラー時は空の配列を返す
    } else {
      // groupNameDataから最初の要素のgroup_nameプロパティを取得し、nullでないことを確認
      const groupNameValue =
        groupNameData.length > 0 && groupNameData[0].group_name
          ? groupNameData[0].group_name
          : "";
      setGroupName(groupNameValue);
    }

    const userInfoWithTasks = await Promise.all(
      data.map(async (entry) => {
        let userTasks: (string | null)[] = [];
        if (entry.users) {
          const { data: tasksData, error: tasksError } = await supabase
            .from("todos_group")
            .select("task")
            .eq("user_id", entry.users.id);

          if (tasksError) {
            console.error("Error fetching user tasks:", tasksError);
          } else {
            userTasks = tasksData.map((task) => task.task);
          }
        }

        return {
          userId: entry.users ? entry.users.id : "Unknown",
          points: entry.users ? entry.users.points || 0 : 0,
          name: entry.users
            ? entry.users.name || entry.users.id.slice(0, 5) + "..."
            : "Unknown",
          tasks: userTasks,
        };
      })
    );

    return userInfoWithTasks;
  };

  useEffect(() => {
    if (session) {
      fetchGroupIdsByUserId(session.user.id)
        .then((groupIds) => {
          console.log("groupId", groupIds);
          setGroupIds(groupIds);
          if (groupIds.length > 0) {
            return fetchUserInfoByGroupId(groupIds[0]);
          }
          return [];
        })
        .then((usersData) => {
          setUserInfo(usersData);
          console.log("userInfo", userInfo);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session]);

  if (!session) {
    // セッションが存在しない場合の処理
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

  if (loading) {
    return <p>Loading...</p>;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // data for the current bar

      return (
        <Box bg="white" p={3} boxShadow="md" borderRadius="md">
          <Text
            fontSize="md"
            fontWeight="bold"
          >{`${data.name}: ${data.points} points`}</Text>
          <List spacing={1}>
            {data.tasks &&
              data.tasks.map(
                (
                  task:
                    | string
                    | number
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | React.ReactFragment
                    | React.ReactPortal
                    | null
                    | undefined,
                  index: React.Key | null | undefined
                ) => (
                  <ListItem key={index}>
                    <Text fontSize="sm">{task}</Text>
                  </ListItem>
                )
              )}
          </List>
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#333", // 背景色
          color: "white", // テキスト色
          padding: "10px", // パディング
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // 影のスタイル
          textAlign: "center", // テキストの位置
          fontSize: "20px", // フォントサイズ
          fontWeight: "bold", // フォントウェイト
        }}
      >
        Room : {groupName}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={userInfo}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          style={{ backgroundColor: "#333" }}
        >
          <XAxis dataKey="name" stroke="#ccc" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="points" fill="#8884d8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default CustomBarChart;
