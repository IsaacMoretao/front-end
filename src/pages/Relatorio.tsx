import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../Stylles/CustomCalendar.css";
import { useTheme } from "../Context/ThemeContext";
import { CaretDown } from "phosphor-react";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { TextField } from "@mui/material";

type PresenceRecord = { [date: string]: number };
type User = {
  id: number;
  username: string;
  presence: Array<{ id: number; createdAt: string }>;
};

const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const binarySearchByNameOrId = (users: User[], searchTerm: string) => {
  const normalizedSearchTerm = normalizeString(searchTerm);

  let left = 0;
  let right = users.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midUserName = normalizeString(users[mid].username);
    const midUserId = String(users[mid].id);

    if (
      midUserName < normalizedSearchTerm &&
      midUserId < normalizedSearchTerm
    ) {
      left = mid + 1;
    } else if (
      midUserName > normalizedSearchTerm &&
      midUserId > normalizedSearchTerm
    ) {
      right = mid - 1;
    } else {
      return mid;
    }
  }

  return -1;
};

export function Relatorio() {
  const [visibleSections, setVisibleSections] = useState<{
    [key: number]: boolean;
  }>({});
  const { darkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const today = new Date();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/listUsers");
        console.log("Response data:", response.data);
        const usersData: User[] = Array.isArray(response.data)
          ? response.data
          : [];
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpen = (userId: number) => {
    setVisibleSections((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  const disableFutureDays = ({ date }: { date: Date }) => {
    return date > today;
  };

  const getTileClassName = (presences: PresenceRecord, date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const points = presences[dateString] || 0;

    if (points === 2) {
      return "multiple-presences";
    } else if (points === 1) {
      return "presence-completed";
    } else if (points > 2) {
      return "presence-error";
    }
  };

  const mapPresences = (presenceArray: Array<{ createdAt: string }>) => {
    const presenceMap: PresenceRecord = {};
    presenceArray.forEach((p) => {
      const dateString = p.createdAt.split("T")[0];
      presenceMap[dateString] = (presenceMap[dateString] || 0) + 1;
    });
    return presenceMap;
  };

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
      return;
    }

    const sortedUsers = [...users].sort((a, b) =>
      normalizeString(a.username).localeCompare(normalizeString(b.username))
    );

    const index = binarySearchByNameOrId(sortedUsers, searchTerm);
    if (index !== -1) {
      setFilteredUsers([sortedUsers[index]]);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  return (
    <>
      <main
        className={`p-16 min-h-[100vh] max-md:p-5 max-sm:p-0 shadow-md ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="flex gap-3 p-3 items-center">
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" },
            }}
            InputLabelProps={{
              style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#f5f5f5" : "#1a1a1a",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
              },
            }}
          />
        </div>
        <div className="flex justify-between items-start flex-wrap max-lg:justify-center gap-5 min-w-[100%]">
          {users.length === 0 ? (
            <p>Carregando usuários...</p>
          ) : (
            filteredUsers.map((user) => {
              const presences = mapPresences(user.presence);

              return (
                <section
                  key={user.id}
                  className={`flex p-4 rounded-lg min w-[400px] max-md:w-[100%] shadow-md max-sm:px-1 relative my-5 ${
                    darkMode
                      ? "bg-gray-800 text-gray-100"
                      : "bg-white text-gray-900"
                  }  ${visibleSections[user.id] ? "h-auto" : "h-24"}`}
                >
                  <div className="flex-grow pl-4  max-sm:px-1">
                    <header className="flex justify-between items-center mb-2">
                      <h2 className="font-semibold text-sm">{user.username}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">ID: {user.id}</span>
                        <div className="relative">
                          <button
                            className="focus:outline-none"
                            onClick={() => handleOpen(user.id)}
                          >
                            <CaretDown
                              size={32}
                              color="#5C46B2"
                              weight="bold"
                            />
                          </button>
                        </div>
                      </div>
                    </header>
                    {visibleSections[user.id] && (
                      <div
                        className={`justify-center h-auto mb-2 transition-all duration-300 ${
                          visibleSections[user.id]
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        }`}
                      >
                        <Calendar
                          tileDisabled={disableFutureDays}
                          tileClassName={({ date }) =>
                            getTileClassName(presences, date)
                          }
                          className={`${
                            darkMode
                              ? "bg-gray-900 text-gray-100 border-gray-700"
                              : "bg-gray-100 text-gray-900 border-gray-300"
                          }`}
                        />
                      </div>
                    )}
                    <footer className="flex justify-between text-sm">
                      <span>{`Presenças no mês: ${
                        Object.keys(presences).length
                      }`}</span>
                    </footer>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
