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

const CustomBarChart = () => {
  const [groupIds, setGroupIds] = useState<(string | null)[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoType[]>([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient<Database>();
  const session = useSession();

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

  const fetchUserInfoByGroupId = async (groupId: string | null) => {
    // groupIdがnullの場合は処理を中止
    if (groupId === null) {
      console.error("Error: Group ID is null.");
      return []; // 空の配列を返して処理を中止
    }

    // groupIdがnullでないと確認された後、クエリを実行
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, users(*)")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching user points by group id:", error);
      return []; // エラー時は空の配列を返す
    }
    console.log("UserInfo", data);

    return data.map((entry) => {
      if (entry.users === null) {
        return {
          userId: entry.user_id || "Unknown",
          points: 0,
          name: "Unknown",
        };
      }

      return {
        userId: entry.users.id,
        points: entry.users.points || 0,
        name: entry.users.name || entry.users.id.slice(0, 5) + "...",
      };
    });
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
    return <p>You are not logged in.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={userInfo}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        style={{ backgroundColor: "#333" }}
      >
        <XAxis dataKey="name" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Legend />
        <Bar dataKey="points" fill="#8884d8" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
