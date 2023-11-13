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

const CustomBarChart = () => {
  const [groupIds, setGroupIds] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
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

  const fetchUserInfoByGroupId = async (groupId) => {
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, users(*)")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching user points by group id:", error);
      return []; // エラー時は空の配列を返す
    }
    console.log("UserInfo", data);

    return data.map((entry) => ({
      userId: entry.users.id,
      points: entry.users.points || 0,
      name: entry.users.name || entry.users.id.slice(0, 5) + "...",
    }));
  };
  // useEffectを使用して、userInfoの状態の更新時にchartDataも更新する
  useEffect(() => {
    setChartData({
      name: userInfo.map((entry) => entry.name),
      datasets: [
        {
          label: "完了したタスクの数",
          data: userInfo.map((entry) => entry.points),
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [userInfo]);

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
