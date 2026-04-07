import { useTheme } from '../Context/ThemeContext';
import { useListUsersForPresence } from '../http/types/useListForUsers';
import { Moon, Sun, SunHorizon } from "phosphor-react";

type Props = {
  userId: number;
};

export function LastPresences({ userId }: Props) {
  const { data, isLoading, error } = useListUsersForPresence({
    userId,
  });
  const { darkMode } = useTheme();
  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar presenças</p>;

  const user = (data as any)?.data
  ? (data as any).data[0]
  : data;

  if (!user) return <p>Usuário não encontrado</p>;

  const lastThreePresences = [...user.presence]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className={`w-full mt-5 mb-20 p-4 max-w-md px-4 rounded-2xl shadow-md  ${darkMode ? "bg-zinc-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}>

      <h3 className="text-sm font-mediu mb-2">
        3 Últimas presenças
      </h3>

      {lastThreePresences.length === 0 ? (
        <p className="text-zinc-400 w-full">Nenhuma presença registrada</p>
      ) : (
        <ul className="space-y-2 w-full ">
          {lastThreePresences.map((presence) => (
            <li
              key={presence.id}
              className={`flex w-full justify-between items-center p-2 px-5 rounded-lg  ${darkMode ? "bg-gray-900 " : "bg-gray-100"}`}
            >

              {presence.period && (
                <span>
                  {presence.period === "MORNING" ? (
                    <SunHorizon size={32} color="#d2b80f" weight="bold" />
                  ) : presence.period === "AFTERNOON" ? (
                    <Sun size={32} color="#dbf708" weight="bold" />
                  ) : presence.period === "NIGHT" ? (
                    <Moon size={32} color="#4a4a4a" weight="duotone" />
                  ) : null}
                </span>
              )}

              <span className="text-sm ">
                
                {new Date(presence.createdAt).toLocaleDateString('pt-BR')}
              </span>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}