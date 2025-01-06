import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "./config";

interface User {
  id: number;
  full_name: string;
  email: string;
  status: string;
}

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch users from UserListView
    axios
      .get(`${config.BASE_URL}api/auth/user-list/`)
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateUserStatus = (userId: number, status: string) => {
    // Update user status using UpdateUserStatusView
    axios
      .post(`${config.BASE_URL}api/auth/update-status/`, { user_id: userId, status })
      .then((response) => {
        alert(response.data.message);
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, status } : user
          )
        );
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const deleteUser = (userId: number) => {
    axios
      .delete(`${config.BASE_URL}api/auth/delete-user/${userId}/`)
      .then((response) => {
        // Convert the response data to a string
        alert(JSON.stringify(response.data));
        // Remove user from the list after successful deletion
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

 return (
    <div className="p-5 bg-gray-100 min-h-screen w-full">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">User Management</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="table-auto w-full text-left border border-gray-300">
                <thead className="bg-gradient-to-t from-sky-400 to-emerald-300 text-blue-900">
                    <tr>
                        <th className="px-6 py-4 text-lg border-b border-gray-300">Name</th>
                        <th className="px-6 py-4 text-lg border-b border-gray-300">Email</th>
                        <th className="px-6 py-4 text-lg border-b border-gray-300">Status</th>
                        <th className="px-6 py-4 text-lg border-b border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                            <td className="px-6 py-4 text-gray-800 border-r border-gray-300">
                                {user.full_name}
                            </td>
                            <td className="px-6 py-4 text-gray-800 border-r border-gray-300">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 text-gray-800 border-r border-gray-300">
                                {user.status}
                            </td>
                            <td className="px-6 py-4 text-gray-800">
                                {user.status !== "approved" && (
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition-all"
                                        onClick={() => updateUserStatus(user.id, "approved")}
                                    >
                                        Approve
                                    </button>
                                )}
                                {user.status !== "rejected" && (
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition-all ml-2"
                                        onClick={() => updateUserStatus(user.id, "rejected")}
                                    >
                                        Reject
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
 );
};

export default UserPage;
